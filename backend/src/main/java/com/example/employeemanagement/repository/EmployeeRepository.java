package com.example.employeemanagement.repository;

import com.example.employeemanagement.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmployeeId(String employeeId);
    Optional<Employee> findByEmployeeId(String employeeId);
    List<Employee> findAllByOrderByIdDesc();
}
