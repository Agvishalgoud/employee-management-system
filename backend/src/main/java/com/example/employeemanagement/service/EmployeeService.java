package com.example.employeemanagement.service;

import com.example.employeemanagement.dto.EmployeeRequest;
import com.example.employeemanagement.entity.Employee;
import com.example.employeemanagement.exception.ResourceNotFoundException;
import com.example.employeemanagement.repository.EmployeeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee create(EmployeeRequest request) {
        String employeeId = request.getEmployeeId().trim();
        if (employeeRepository.existsByEmployeeId(employeeId)) {
            throw new IllegalArgumentException("Employee ID " + employeeId + " already exists.");
        }

        Employee employee = new Employee(
                request.getName().trim(),
                employeeId,
                request.getAddress().trim()
        );
        return employeeRepository.save(employee);
    }

    @Transactional(readOnly = true)
    public List<Employee> findAll() {
        return employeeRepository.findAllByOrderByIdDesc();
    }

    public Employee update(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee with ID " + id + " was not found."));

        String requestedEmployeeId = request.getEmployeeId().trim();
        employeeRepository.findByEmployeeId(requestedEmployeeId).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Employee ID " + requestedEmployeeId + " already exists.");
            }
        });

        employee.setName(request.getName().trim());
        employee.setEmployeeId(requestedEmployeeId);
        employee.setAddress(request.getAddress().trim());
        return employeeRepository.save(employee);
    }
}
