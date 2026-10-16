-- Fix UTF-8 characters that were corrupted during phpMyAdmin import
-- Run this in phpMyAdmin against u460080312_miiccof_db

UPDATE `section` SET `body` = REPLACE(`body`, 'ΓÇö', '—') WHERE `body` LIKE '%ΓÇö%';
UPDATE `section` SET `body` = REPLACE(`body`, 'ΓÇô', '–') WHERE `body` LIKE '%ΓÇô%';
UPDATE `section` SET `metadata` = REPLACE(`metadata`, 'ΓÇö', '—') WHERE `metadata` LIKE '%ΓÇö%';
UPDATE `section` SET `metadata` = REPLACE(`metadata`, 'ΓÇô', '–') WHERE `metadata` LIKE '%ΓÇô%';

UPDATE `news` SET `content` = REPLACE(`content`, 'ΓÇö', '—') WHERE `content` LIKE '%ΓÇö%';
UPDATE `news` SET `content` = REPLACE(`content`, 'ΓÇô', '–') WHERE `content` LIKE '%ΓÇô%';
UPDATE `news` SET `excerpt` = REPLACE(`excerpt`, 'ΓÇö', '—') WHERE `excerpt` LIKE '%ΓÇö%';
UPDATE `news` SET `excerpt` = REPLACE(`excerpt`, 'ΓÇô', '–') WHERE `excerpt` LIKE '%ΓÇô%';

UPDATE `site_setting` SET `value` = REPLACE(`value`, 'ΓÇö', '—') WHERE `value` LIKE '%ΓÇö%';
UPDATE `site_setting` SET `value` = REPLACE(`value`, 'ΓÇô', '–') WHERE `value` LIKE '%ΓÇô%';
