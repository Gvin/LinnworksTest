CREATE DATABASE LinnworksTest;

CREATE USER 'LinnworksUser' IDENTIFIED BY 'password123';

GRANT SELECT, UPDATE, INSERT, DELETE ON LinnworksTest.* TO 'LinnworksUser';

FLUSH PRIVILEGES;