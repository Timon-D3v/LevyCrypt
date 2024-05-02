CREATE SCHEMA `matura_chat_app`;

CREATE TABLE `matura_chat_app`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(256) NOT NULL,
  `password` VARCHAR(512) NOT NULL,
  `picture` VARCHAR(512) NULL DEFAULT '/img/svg/user.svg',
  `name` VARCHAR(256) NOT NULL,
  `family_name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idusers_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'This table holds all information that is stored about the user.';