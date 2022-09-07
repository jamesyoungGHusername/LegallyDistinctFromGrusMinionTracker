DROP DATABASE IF EXISTS minionTracker_db;
CREATE DATABASE minionTracker_db;

USE minionTracker_db;

CREATE TABLE departments (
    id INT,
    d_name VARCHAR(100),
    d_desc VARCHAR(100),
    PRIMARY KEY (d_name)
);

CREATE TABLE roles(
    id INT,
    title VARCHAR(100),
    r_desc VARCHAR(100),
    PRIMARY KEY (title)
);

CREATE TABLE employees (
  id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  roleTitle VARCHAR(100),
  deptName VARCHAR(100),
  PRIMARY KEY (id),
  CONSTRAINT FOREIGN KEY (roleTitle) REFERENCES roles(title),
  CONSTRAINT FOREIGN KEY (deptName) REFERENCES departments(d_name)
  
);

