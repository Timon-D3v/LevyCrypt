CREATE TABLE `matura_chat_app`.`files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `from` VARCHAR(512) NOT NULL,
  `to` VARCHAR(512) NOT NULL,
  `filename` VARCHAR(2048) NOT NULL,
  `base64` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'This table indices every file that is uploaded from endusers.';
