package com.delvex.server.auth.ratelimit;

import java.net.InetAddress;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ClientIpResolverTest {

    private static final String PROXY_SECRET =
            "0123456789abcdef0123456789abcdef";

    @Test
    void shouldResolveClientFromAuthenticatedInternalProxy() {
        ClientIpResolver resolver = new ClientIpResolver(
                List.of(),
                PROXY_SECRET);
        MockHttpServletRequest request = requestFrom(
                "10.0.0.3");
        request.addHeader(
                "X-Delvex-Client-IP",
                "198.51.100.25");
        request.addHeader(
                "X-Delvex-Proxy-Secret",
                PROXY_SECRET);

        assertEquals(
                "198.51.100.25",
                resolver.resolve(request));
    }

    @Test
    void shouldIgnoreInternalClientIpWithInvalidSecret() {
        ClientIpResolver resolver = new ClientIpResolver(
                List.of(),
                PROXY_SECRET);
        MockHttpServletRequest request = requestFrom(
                "10.0.0.3");
        request.addHeader(
                "X-Delvex-Client-IP",
                "198.51.100.25");
        request.addHeader(
                "X-Delvex-Proxy-Secret",
                "wrong-secret");

        assertEquals(
                "10.0.0.3",
                resolver.resolve(request));
    }

    @Test
    void shouldIgnoreForwardedHeadersFromUntrustedPeer() {
        ClientIpResolver resolver = new ClientIpResolver(
                List.of("10.0.0.0/8"));
        MockHttpServletRequest request = requestFrom(
                "198.51.100.10");
        request.addHeader(
                "X-Forwarded-For",
                "203.0.113.25");

        assertEquals(
                "198.51.100.10",
                resolver.resolve(request));
    }

    @Test
    void shouldResolveClientFromTrustedProxyChain() {
        ClientIpResolver resolver = new ClientIpResolver(
                List.of("10.0.0.0/8"));
        MockHttpServletRequest request = requestFrom("10.0.0.3");
        request.addHeader(
                "X-Forwarded-For",
                "198.51.100.25, 10.0.0.2");

        assertEquals(
                "198.51.100.25",
                resolver.resolve(request));
    }

    @Test
    void shouldIgnoreSpoofedAddressesBeforeRightmostClient() {
        ClientIpResolver resolver = new ClientIpResolver(
                List.of("10.0.0.0/8"));
        MockHttpServletRequest request = requestFrom("10.0.0.3");
        request.addHeader(
                "X-Forwarded-For",
                "203.0.113.99, 198.51.100.25, 10.0.0.2");

        assertEquals(
                "198.51.100.25",
                resolver.resolve(request));
    }

    @Test
    void shouldResolveQuotedIpv6FromForwardedHeader()
            throws Exception {
        ClientIpResolver resolver = new ClientIpResolver(
                List.of("2001:db8:ffff::/48"));
        MockHttpServletRequest request = requestFrom(
                "2001:db8:ffff::2");
        request.addHeader(
                "Forwarded",
                "for=\"[2001:db8:abcd::25]:4711\";proto=https, "
                        + "for=\"[2001:db8:ffff::1]\"");

        assertEquals(
                InetAddress.getByName("2001:db8:abcd::25")
                        .getHostAddress(),
                resolver.resolve(request));
    }

    @Test
    void shouldFallBackToXForwardedForWhenForwardedIsUnknown() {
        ClientIpResolver resolver = new ClientIpResolver(
                List.of("10.0.0.0/8"));
        MockHttpServletRequest request = requestFrom("10.0.0.3");
        request.addHeader("Forwarded", "for=unknown");
        request.addHeader(
                "X-Forwarded-For",
                "198.51.100.25");

        assertEquals(
                "198.51.100.25",
                resolver.resolve(request));
    }

    @Test
    void shouldRejectInvalidTrustedProxyCidr() {
        assertThrows(
                IllegalArgumentException.class,
                () -> new ClientIpResolver(
                        List.of("not-a-cidr")));
    }

    private MockHttpServletRequest requestFrom(
            String remoteAddress) {
        MockHttpServletRequest request =
                new MockHttpServletRequest();
        request.setRemoteAddr(remoteAddress);

        return request;
    }
}
