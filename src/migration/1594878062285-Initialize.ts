import {MigrationInterface, QueryRunner} from "typeorm";

export class Initialize1594878062285 implements MigrationInterface {
    name = 'Initialize1594878062285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `image` (`id` varchar(36) NOT NULL, `name` varchar(255) NULL, `slug` varchar(255) NOT NULL, `url` text NOT NULL, `description` text NULL, `createdAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `deletedAt` datetime(0) NULL DEFAULT NULL, `contentId` varchar(36) NULL, UNIQUE INDEX `IDX_045fd3c3936b737912f4b95aba` (`slug`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `tag` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `slug` varchar(255) NOT NULL, `createdAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `deletedAt` datetime(0) NULL DEFAULT NULL, UNIQUE INDEX `IDX_3413aed3ecde54f832c4f44f04` (`slug`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `content` (`id` varchar(36) NOT NULL, `title` varchar(255) NULL, `subtitle` varchar(255) NULL, `body` text NULL, `slug` varchar(255) NOT NULL, `categoryId` varchar(255) NULL, `imageId` varchar(255) NULL, `createdAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `deletedAt` datetime(0) NULL DEFAULT NULL, UNIQUE INDEX `IDX_dfe3ab560d448427f463febbe7` (`slug`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `category` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `slug` varchar(255) NOT NULL, `createdAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `deletedAt` datetime(0) NULL DEFAULT NULL, `contentId` varchar(36) NULL, UNIQUE INDEX `IDX_cb73208f151aa71cdd78f662d7` (`slug`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(255) NOT NULL, `password` varchar(255) NULL, `firstName` varchar(255) NULL, `lastName` varchar(255) NULL, `country` varchar(255) NULL, `birthdate` datetime NULL, `createdAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `deletedAt` datetime(0) NULL DEFAULT NULL, UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `session` (`id` varchar(36) NOT NULL, `userId` int NULL, `agent` varchar(255) NULL, `ipAddress` varchar(255) NULL, `expiresAt` timestamp(0) NULL DEFAULT NULL, `activeAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `deletedAt` datetime(0) NULL DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `content_tag_tag` (`contentId` varchar(36) NOT NULL, `tagId` varchar(36) NOT NULL, INDEX `IDX_02dff9435c8ec4dcfbf5217b50` (`contentId`), INDEX `IDX_5257b52b6d5641add91de83e94` (`tagId`), PRIMARY KEY (`contentId`, `tagId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `image` ADD CONSTRAINT `FK_824c64d2a69f1b8a94527106acb` FOREIGN KEY (`contentId`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `category` ADD CONSTRAINT `FK_c2d639cd104d130c11331a2537e` FOREIGN KEY (`contentId`) REFERENCES `content`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `session` ADD CONSTRAINT `FK_3d2f174ef04fb312fdebd0ddc53` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content_tag_tag` ADD CONSTRAINT `FK_02dff9435c8ec4dcfbf5217b507` FOREIGN KEY (`contentId`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content_tag_tag` ADD CONSTRAINT `FK_5257b52b6d5641add91de83e948` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `content_tag_tag` DROP FOREIGN KEY `FK_5257b52b6d5641add91de83e948`");
        await queryRunner.query("ALTER TABLE `content_tag_tag` DROP FOREIGN KEY `FK_02dff9435c8ec4dcfbf5217b507`");
        await queryRunner.query("ALTER TABLE `session` DROP FOREIGN KEY `FK_3d2f174ef04fb312fdebd0ddc53`");
        await queryRunner.query("ALTER TABLE `category` DROP FOREIGN KEY `FK_c2d639cd104d130c11331a2537e`");
        await queryRunner.query("ALTER TABLE `image` DROP FOREIGN KEY `FK_824c64d2a69f1b8a94527106acb`");
        await queryRunner.query("DROP INDEX `IDX_5257b52b6d5641add91de83e94` ON `content_tag_tag`");
        await queryRunner.query("DROP INDEX `IDX_02dff9435c8ec4dcfbf5217b50` ON `content_tag_tag`");
        await queryRunner.query("DROP TABLE `content_tag_tag`");
        await queryRunner.query("DROP TABLE `session`");
        await queryRunner.query("DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP INDEX `IDX_cb73208f151aa71cdd78f662d7` ON `category`");
        await queryRunner.query("DROP TABLE `category`");
        await queryRunner.query("DROP INDEX `IDX_dfe3ab560d448427f463febbe7` ON `content`");
        await queryRunner.query("DROP TABLE `content`");
        await queryRunner.query("DROP INDEX `IDX_3413aed3ecde54f832c4f44f04` ON `tag`");
        await queryRunner.query("DROP TABLE `tag`");
        await queryRunner.query("DROP INDEX `IDX_045fd3c3936b737912f4b95aba` ON `image`");
        await queryRunner.query("DROP TABLE `image`");
    }

}
