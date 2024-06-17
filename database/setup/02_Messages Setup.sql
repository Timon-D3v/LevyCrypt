CREATE TABLE `matura_chat_app`.`chats` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `from` VARCHAR(256) NOT NULL,
  `to` VARCHAR(256) NOT NULL,
  `message` JSON NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
COMMENT = 'This table holds all messages of the users.';
