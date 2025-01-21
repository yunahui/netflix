DROP DATABASE IF EXISTS `netflix`;
CREATE DATABASE `netflix` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'netflix'@'%' IDENTIFIED BY 'netflix';
GRANT ALL PRIVILEGES ON `netflix`.* TO 'netflix'@'%';

FLUSH PRIVILEGES;

USE `netflix`;

DROP TABLE IF EXISTS `movie`;
CREATE TABLE `movie` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `genre` VARCHAR(255) NOT NULL,
    `director_id` INT,
    PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `director`;
CREATE TABLE `director` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
);
ALTER TABLE `movie` ADD CONSTRAINT `fk_director` FOREIGN KEY (`director_id`) REFERENCES `director`(`id`);

