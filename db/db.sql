DROP DATABASE IF EXISTS `netflix`;
CREATE DATABASE `netflix` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'netflix'@'%' IDENTIFIED BY 'netflix';
GRANT ALL PRIVILEGES ON `netflix`.* TO 'netflix'@'%';