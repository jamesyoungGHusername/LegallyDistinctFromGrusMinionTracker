DROP DATABASE IF EXISTS minionTracker_db;
CREATE DATABASE minionTracker_db;

USE minionTracker_db;

CREATE TABLE departments (
    id INT AUTO_INCREMENT,
    d_name VARCHAR(100),
    d_desc VARCHAR(100),
    PRIMARY KEY (id, d_name)
);

CREATE TABLE roles(
    id INT AUTO_INCREMENT,
    deptID INT NOT NULL,
    deptName VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    r_desc VARCHAR(100),
    salary VARCHAR(100) NOT NULL,
    PRIMARY KEY (id, title,salary),
    CONSTRAINT FOREIGN KEY (deptID,deptName) REFERENCES departments(id,d_name)
);

CREATE TABLE employees (
  id INT NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  roleID INT,
  roleTitle VARCHAR(100),
  salary VARCHAR(100) NOT NULL,
  deptID INT,
  deptName VARCHAR(100),
  managerID INT,
  PRIMARY KEY (id),
  CONSTRAINT FOREIGN KEY (roleID, roleTitle, salary) REFERENCES roles(id, title, salary),
  CONSTRAINT FOREIGN KEY (deptID, deptName) REFERENCES departments(id, d_name)
  
);

