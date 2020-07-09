import {MigrationInterface, QueryRunner} from "typeorm";

export class Initialize1594269435878 implements MigrationInterface {
    name = 'Initialize1594269435878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(255) NOT NULL, `password` varchar(255) NULL, `firstName` varchar(255) NULL, `lastName` varchar(255) NULL, `country` varchar(255) NULL, `birthdate` datetime NULL, `createdAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `deletedAt` datetime(0) NULL DEFAULT NULL, UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `session` (`id` varchar(36) NOT NULL, `userId` int NULL, `agent` varchar(255) NULL, `ipAddress` varchar(255) NULL, `expiresAt` timestamp(0) NULL DEFAULT NULL, `activeAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdAt` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP, `deletedAt` datetime(0) NULL DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `session` ADD CONSTRAINT `FK_3d2f174ef04fb312fdebd0ddc53` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `session` DROP FOREIGN KEY `FK_3d2f174ef04fb312fdebd0ddc53`");
        await queryRunner.query("DROP TABLE `session`");
        await queryRunner.query("DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
    }

}
