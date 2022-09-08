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
    title VARCHAR(100),
    r_desc VARCHAR(100),
    PRIMARY KEY (id, title)
);

CREATE TABLE employees (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  roleID INT,
  roleTitle VARCHAR(100),
  deptID INT,
  deptName VARCHAR(100),
  managerID INT,
  PRIMARY KEY (id),
  CONSTRAINT FOREIGN KEY (roleID, roleTitle) REFERENCES roles(id, title),
  CONSTRAINT FOREIGN KEY (deptID, deptName) REFERENCES departments(id, d_name)
  
);

