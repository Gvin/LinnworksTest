CREATE DATABASE LinnworksTest;

CREATE USER 'LinnworksUser' IDENTIFIED BY 'password123';

GRANT ALL ON LinnworksTest.* TO 'LinnworksUser';

FLUSH PRIVILEGES;