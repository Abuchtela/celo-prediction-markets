CREATE TABLE `aiForecasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`marketId` int NOT NULL,
	`analysis` text NOT NULL,
	`suggestedOutcomeId` int,
	`confidence` decimal(5,4) NOT NULL DEFAULT '0.5000',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiForecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`marketId` int NOT NULL,
	`outcomeId` int NOT NULL,
	`type` enum('buy','sell') NOT NULL,
	`shares` decimal(18,6) NOT NULL,
	`pricePerShare` decimal(8,6) NOT NULL,
	`totalCost` decimal(18,6) NOT NULL,
	`currency` enum('cUSD','cEUR','cREAL') NOT NULL DEFAULT 'cUSD',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalWinnings` decimal(18,6) NOT NULL DEFAULT '0.000000',
	`accuracyScore` decimal(8,4) NOT NULL DEFAULT '0.0000',
	`marketsParticipated` int NOT NULL DEFAULT 0,
	`marketsWon` int NOT NULL DEFAULT 0,
	`rank` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboard_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaderboard_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `markets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` enum('crypto','politics','sports','economics','technology','entertainment') NOT NULL,
	`status` enum('open','closed','resolved','cancelled') NOT NULL DEFAULT 'open',
	`resolutionCriteria` text,
	`resolvedOutcomeId` int,
	`totalLiquidity` decimal(18,6) NOT NULL DEFAULT '0.000000',
	`totalVolume` decimal(18,6) NOT NULL DEFAULT '0.000000',
	`creatorId` int,
	`featured` boolean NOT NULL DEFAULT false,
	`expiresAt` timestamp NOT NULL,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `markets_id` PRIMARY KEY(`id`),
	CONSTRAINT `markets_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `outcomes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`marketId` int NOT NULL,
	`label` varchar(128) NOT NULL,
	`probability` decimal(8,6) NOT NULL DEFAULT '0.500000',
	`totalShares` decimal(18,6) NOT NULL DEFAULT '0.000000',
	`pricePerShare` decimal(8,6) NOT NULL DEFAULT '0.500000',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outcomes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`marketId` int NOT NULL,
	`outcomeId` int NOT NULL,
	`shares` decimal(18,6) NOT NULL DEFAULT '0.000000',
	`avgCostPerShare` decimal(8,6) NOT NULL DEFAULT '0.000000',
	`totalInvested` decimal(18,6) NOT NULL DEFAULT '0.000000',
	`realizedPnl` decimal(18,6) NOT NULL DEFAULT '0.000000',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `balanceCUSD` decimal(18,6) DEFAULT '1000.000000' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `balanceCEUR` decimal(18,6) DEFAULT '500.000000' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `balanceCREAL` decimal(18,6) DEFAULT '2000.000000' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `walletAddress` varchar(42);