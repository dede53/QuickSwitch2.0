-- phpMyAdmin SQL Dump
-- version 4.7.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Erstellungszeit: 16. Sep 2017 um 13:06
-- Server-Version: 5.5.57-0+deb8u1
-- PHP-Version: 5.6.30-0+deb8u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Datenbank: `SmartHome`
--
CREATE DATABASE IF NOT EXISTS `SmartHome` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `SmartHome`;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `charttypen`
--

CREATE TABLE IF NOT EXISTS `charttypen` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `chart` varchar(20) NOT NULL DEFAULT '',
  `name` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `countdowns`
--

CREATE TABLE IF NOT EXISTS `countdowns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` int(11) NOT NULL DEFAULT 0,
  `time` varchar(20) NOT NULL DEFAULT '',
  `switchid` int(11) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 0,
  `user` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `countdowntypen`
--

CREATE TABLE IF NOT EXISTS `countdowntypen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `devices`
--

CREATE TABLE IF NOT EXISTS `devices` (
  `deviceid` int(11) NOT NULL AUTO_INCREMENT,
  `status` int(50) NOT NULL DEFAULT '1',
  `showStatus` int(2) NOT NULL DEFAULT '1',
  `name` varchar(40) NOT NULL DEFAULT '',
  `protocol` varchar(40) NOT NULL DEFAULT '',
  `buttonLabelOn` varchar(20) NOT NULL DEFAULT '',
  `buttonLabelOff` varchar(20) NOT NULL DEFAULT '',
  `CodeOn` varchar(200) NOT NULL DEFAULT '',
  `CodeOff` varchar(200) NOT NULL DEFAULT '',
  `roomid` int(11) NOT NULL DEFAULT 1,
  `switchserver` int(11) NOT NULL DEFAULT 1,
  `type` varchar(30) NOT NULL DEFAULT 'device',
  PRIMARY KEY (`deviceid`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `groups`
--

CREATE TABLE IF NOT EXISTS `groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '',
  `devices` varchar(200) NOT NULL DEFAULT '',
  `user` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `linetypen`
--

CREATE TABLE IF NOT EXISTS `linetypen` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL DEFAULT '',
  `line` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `messages`
--

CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `time` varchar(20) NOT NULL DEFAULT '',
  `type` int(11) NOT NULL DEFAULT 1,
  `author` varchar(20) NOT NULL DEFAULT '',
  `message` varchar(200) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `messagetypen`
--

CREATE TABLE IF NOT EXISTS `messagetypen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(11) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `rooms`
--

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sensors`
--

-- CREATE TABLE IF NOT EXISTS `sensors` (
--   `id` bigint(11) NOT NULL DEFAULT '',
--   `name` varchar(255) NOT NULL DEFAULT '',
--   `nodeid` varchar(255) NOT NULL DEFAULT '',
--   `charttype` varchar(255) NOT NULL DEFAULT '',
--   `linetype` varchar(255) NOT NULL DEFAULT '',
--   `linecolor` varchar(255) NOT NULL DEFAULT ''
-- ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `stored_vars`
--

CREATE TABLE IF NOT EXISTS `stored_vars` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(255) NOT NULL DEFAULT '',
  `time` varchar(20) NOT NULL DEFAULT '',
  `value` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `id` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=57149 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `switch_history`
--

CREATE TABLE IF NOT EXISTS `switch_history` (
  `deviceid` int(20) NOT NULL DEFAULT 0,
  `time` varchar(20) NOT NULL DEFAULT 0,
  `status` int(10) NOT NULL DEFAULT 1,
  `place` varchar(300) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `timer`
--

CREATE TABLE IF NOT EXISTS `timer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL DEFAULT '',
  `active` varchar(10) NOT NULL DEFAULT 'true',
  `variables` varchar(1000) NOT NULL DEFAULT '',
  `conditions` varchar(1000) NOT NULL DEFAULT '',
  `actions` varchar(1000) NOT NULL DEFAULT '',
  `user` varchar(20) NOT NULL DEFAULT 'system',
  `lastexec` varchar(15) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '',
  `favoritDevices` varchar(200) NOT NULL DEFAULT '[]',
  `favoritVariables` varchar(200) NOT NULL DEFAULT '[]',
  `varChart` varchar(200) NOT NULL DEFAULT '[]',
  `variables` varchar(200) NOT NULL DEFAULT '[]',
  `admin` varchar(20) NOT NULL DEFAULT 'false',
  `chartHour` int(20) NOT NULL DEFAULT 24,
  `background` varchar(500) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `variable`
--

CREATE TABLE IF NOT EXISTS `variable` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(255) NOT NULL DEFAULT '',
  `name` varchar(255) NOT NULL DEFAULT '',
  `status` varchar(20) NOT NULL DEFAULT '',
  `charttype` varchar(255) NOT NULL DEFAULT '',
  `linetype` varchar(255) NOT NULL DEFAULT '',
  `linecolor` varchar(255) NOT NULL DEFAULT '',
  `suffix` varchar(10) NOT NULL DEFAULT '',
  `error` varchar(255) NOT NULL DEFAULT '',
  `step` varchar(20) NOT NULL DEFAULT 'false',
  `showall` varchar(20) NOT NULL DEFAULT 'false',
  `user` varchar(20) NOT NULL DEFAULT 'system',
  `saveActive` varchar(20) NOT NULL DEFAULT 'false',
  `saveType` varchar(20) NOT NULL DEFAULT 'onchange',
  `saveInterval` int(11) NOT NULL DEFAULT '5',
  `lastChange` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;
COMMIT;
