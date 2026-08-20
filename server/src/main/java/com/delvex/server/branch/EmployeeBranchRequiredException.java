package com.delvex.server.branch;

public class EmployeeBranchRequiredException extends RuntimeException {

    public EmployeeBranchRequiredException() {
        super("Employee is not assigned to an active branch");
    }
}
