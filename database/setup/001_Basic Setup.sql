CREATE SCHEMA `matura_chat_app` ;

CREATE TABLE `matura_chat_app`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(1000) NOT NULL,
  `password` VARCHAR(1000) NOT NULL,
  `picture` VARCHAR(1000) NULL DEFAULT '/img/svg/user.svg',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);