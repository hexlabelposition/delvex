package com.delvex.server.auth.ratelimit;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

public class ClientIpResolver {

    private static final String FORWARDED_HEADER = "Forwarded";
    private static final String X_FORWARDED_FOR_HEADER = "X-Forwarded-For";

    private final List<IpSubnet> trustedProxies;

    public ClientIpResolver(List<String> trustedProxyCidrs) {
        this.trustedProxies = trustedProxyCidrs.stream()
                .filter(cidr -> !cidr.isBlank())
                .map(IpSubnet::parse)
                .toList();
    }

    public String resolve(HttpServletRequest request) {
        String remoteAddress = request.getRemoteAddr();
        InetAddress peer = parseAddress(remoteAddress);

        if (peer == null || !isTrusted(peer)) {
            return peer == null
                    ? remoteAddress
                    : peer.getHostAddress();
        }

        List<InetAddress> forwardedAddresses =
                parseForwarded(request);

        if (forwardedAddresses.isEmpty()) {
            forwardedAddresses = parseXForwardedFor(request);
        }

        if (forwardedAddresses.isEmpty()) {
            return peer.getHostAddress();
        }

        for (int index = forwardedAddresses.size() - 1;
                index >= 0;
                index--) {
            InetAddress candidate = forwardedAddresses.get(index);

            if (!isTrusted(candidate)) {
                return candidate.getHostAddress();
            }
        }

        return forwardedAddresses.get(0).getHostAddress();
    }

    private List<InetAddress> parseForwarded(
            HttpServletRequest request) {
        List<InetAddress> addresses = new ArrayList<>();

        for (String header : Collections.list(
                request.getHeaders(FORWARDED_HEADER))) {
            for (String element : split(header, ',')) {
                for (String parameter : split(element, ';')) {
                    int separator = parameter.indexOf('=');

                    if (separator < 0
                            || !parameter.substring(0, separator)
                                    .trim()
                                    .equalsIgnoreCase("for")) {
                        continue;
                    }

                    InetAddress address = parseAddressToken(
                            parameter.substring(separator + 1));

                    if (address != null) {
                        addresses.add(address);
                    }

                    break;
                }
            }
        }

        return addresses;
    }

    private List<InetAddress> parseXForwardedFor(
            HttpServletRequest request) {
        List<InetAddress> addresses = new ArrayList<>();

        for (String header : Collections.list(
                request.getHeaders(X_FORWARDED_FOR_HEADER))) {
            for (String token : header.split(",")) {
                InetAddress address = parseAddressToken(token);

                if (address != null) {
                    addresses.add(address);
                }
            }
        }

        return addresses;
    }

    private List<String> split(String value, char separator) {
        List<String> parts = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;
        boolean escaped = false;

        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);

            if (escaped) {
                current.append(character);
                escaped = false;
                continue;
            }

            if (character == '\\' && quoted) {
                current.append(character);
                escaped = true;
                continue;
            }

            if (character == '"') {
                quoted = !quoted;
                current.append(character);
                continue;
            }

            if (character == separator && !quoted) {
                parts.add(current.toString().trim());
                current.setLength(0);
                continue;
            }

            current.append(character);
        }

        parts.add(current.toString().trim());

        return parts;
    }

    private InetAddress parseAddressToken(String value) {
        String token = unquote(value.trim());

        if (token.isBlank()
                || token.equalsIgnoreCase("unknown")
                || token.startsWith("_")) {
            return null;
        }

        if (token.startsWith("[")) {
            int closingBracket = token.indexOf(']');

            if (closingBracket < 0) {
                return null;
            }

            token = token.substring(1, closingBracket);
        } else if (token.chars().filter(character ->
                character == ':').count() == 1) {
            int portSeparator = token.lastIndexOf(':');
            String port = token.substring(portSeparator + 1);

            if (port.chars().allMatch(Character::isDigit)) {
                token = token.substring(0, portSeparator);
            }
        }

        return parseAddress(token);
    }

    private String unquote(String value) {
        if (value.length() < 2
                || value.charAt(0) != '"'
                || value.charAt(value.length() - 1) != '"') {
            return value;
        }

        StringBuilder result = new StringBuilder();

        for (int index = 1; index < value.length() - 1; index++) {
            char character = value.charAt(index);

            if (character == '\\'
                    && index + 1 < value.length() - 1) {
                index++;
                character = value.charAt(index);
            }

            result.append(character);
        }

        return result.toString();
    }

    private boolean isTrusted(InetAddress address) {
        return trustedProxies.stream()
                .anyMatch(proxy -> proxy.contains(address));
    }

    private static InetAddress parseAddress(String value) {
        if (value == null || value.isBlank() || value.contains("%")) {
            return null;
        }

        if (value.contains(":")) {
            if (!value.matches("[0-9a-fA-F:.]+")) {
                return null;
            }

            return parseInetAddress(value);
        }

        String[] octets = value.split("\\.", -1);

        if (octets.length != 4) {
            return null;
        }

        byte[] bytes = new byte[4];

        for (int index = 0; index < octets.length; index++) {
            try {
                int octet = Integer.parseInt(octets[index]);

                if (octet < 0 || octet > 255) {
                    return null;
                }

                bytes[index] = (byte) octet;
            } catch (NumberFormatException exception) {
                return null;
            }
        }

        try {
            return InetAddress.getByAddress(bytes);
        } catch (UnknownHostException exception) {
            return null;
        }
    }

    private static InetAddress parseInetAddress(String value) {
        try {
            return InetAddress.getByName(value);
        } catch (UnknownHostException exception) {
            return null;
        }
    }

    private record IpSubnet(
            byte[] network,
            int prefixLength) {

        private static IpSubnet parse(String value) {
            String cidr = value.trim();
            int separator = cidr.indexOf('/');
            String addressValue = separator < 0
                    ? cidr
                    : cidr.substring(0, separator);
            InetAddress address = parseAddress(addressValue);

            if (address == null) {
                throw new IllegalArgumentException(
                        "Invalid trusted proxy CIDR: " + value);
            }

            int maximumPrefixLength =
                    address.getAddress().length * Byte.SIZE;
            int prefixLength = separator < 0
                    ? maximumPrefixLength
                    : parsePrefixLength(
                            cidr.substring(separator + 1),
                            value);

            if (prefixLength < 0
                    || prefixLength > maximumPrefixLength) {
                throw new IllegalArgumentException(
                        "Invalid trusted proxy CIDR: " + value);
            }

            byte[] network = address.getAddress().clone();
            applyMask(network, prefixLength);

            return new IpSubnet(network, prefixLength);
        }

        private static int parsePrefixLength(
                String value,
                String cidr) {
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException exception) {
                throw new IllegalArgumentException(
                        "Invalid trusted proxy CIDR: " + cidr,
                        exception);
            }
        }

        private static void applyMask(
                byte[] address,
                int prefixLength) {
            for (int index = 0; index < address.length; index++) {
                int remainingBits = prefixLength - index * Byte.SIZE;
                int mask;

                if (remainingBits >= Byte.SIZE) {
                    mask = 0xff;
                } else if (remainingBits <= 0) {
                    mask = 0;
                } else {
                    mask = 0xff << (Byte.SIZE - remainingBits);
                }

                address[index] = (byte) (address[index] & mask);
            }
        }

        private boolean contains(InetAddress address) {
            byte[] candidate = address.getAddress().clone();

            if (candidate.length != network.length) {
                return false;
            }

            applyMask(candidate, prefixLength);

            return Arrays.equals(network, candidate);
        }
    }
}
