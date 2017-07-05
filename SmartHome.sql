-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Erstellungszeit: 05. Apr 2017 um 13:27
-- Server-Version: 5.5.54-0+deb8u1
-- PHP-Version: 5.6.29-0+deb8u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `SmartHome`
--
CREATE DATABASE IF NOT EXISTS `SmartHome` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `SmartHome`;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `charttypen`
--

CREATE TABLE `charttypen` (
  `id` bigint(11) NOT NULL,
  `chart` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `charttypen`
--

INSERT INTO `charttypen` (`id`, `chart`, `name`) VALUES
(1, 'line', 'Linie'),
(2, 'spline', 'gerundete Linie'),
(3, 'area', 'Area'),
(4, 'areaspline', 'Area, gerundet'),
(5, 'column', 'Column'),
(6, 'bar', 'Bar'),
(7, 'pie', 'Torte'),
(8, 'scatter', 'Scatter');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `countdowns`
--

CREATE TABLE `countdowns` (
  `id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `time` varchar(20) NOT NULL,
  `switchid` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `user` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `countdowntypen`
--

CREATE TABLE `countdowntypen` (
  `id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `countdowntypen`
--

INSERT INTO `countdowntypen` (`id`, `type`) VALUES
(1, 'device'),
(2, 'room'),
(3, 'group');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `devices`
--

CREATE TABLE `devices` (
  `deviceid` int(11) NOT NULL,
  `status` int(50) NOT NULL,
  `showStatus` boolean(20) NOT NULL DEFAULT 1,
  `name` varchar(40) NOT NULL,
  `protocol` varchar(40) NOT NULL,
  `buttonLabelOn` varchar(20) NOT NULL,
  `buttonLabelOff` varchar(20) NOT NULL,
  `CodeOn` varchar(200) NOT NULL,
  `CodeOff` varchar(200) NOT NULL,
  `roomid` int(11) NOT NULL,
  `switchserver` int(11) NOT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'device'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `devices` varchar(200) NOT NULL,
  `user` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `linetypen`
--

CREATE TABLE `linetypen` (
  `id` bigint(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `line` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `linetypen`
--

INSERT INTO `linetypen` (`id`, `name`, `line`) VALUES
(1, 'durchgezogen', 'Solid'),
(2, 'ShortDash', 'ShortDash'),
(3, 'ShortDot', 'ShortDot'),
(4, 'ShortDashDot', 'ShortDashDot'),
(5, 'ShortDashDotDot', 'ShortDashDotDot'),
(6, 'Dot', 'Dot'),
(7, 'Dash', 'Dash'),
(8, 'LongDash', 'LongDash'),
(9, 'DashDot', 'DashDot'),
(10, 'LongDashDot', 'LongDashDot'),
(11, 'LongDashDotDot', 'LongDashDotDot');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `time` varchar(20) NOT NULL,
  `type` int(11) NOT NULL,
  `author` varchar(20) NOT NULL,
  `message` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `messagetypen`
--

CREATE TABLE `messagetypen` (
  `id` int(11) NOT NULL,
  `type` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `messagetypen`
--

INSERT INTO `messagetypen` (`id`, `type`) VALUES
(1, 'Text'),
(2, 'Link');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sensors`
--

CREATE TABLE `sensors` (
  `id` bigint(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `nodeid` varchar(255) NOT NULL,
  `charttype` varchar(255) NOT NULL,
  `linetype` varchar(255) NOT NULL,
  `linecolor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `stored_vars`
--

CREATE TABLE `stored_vars` (
  -- `id` int(11) NOT NULL,
  `id` varchar(20) NOT NULL,
  `time` varchar(20) NOT NULL,
  `value` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `timer`
--

CREATE TABLE `timer` (
  `id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `active` varchar(10) NOT NULL DEFAULT 'true',
  `variables` varchar(1000) NOT NULL,
  `conditions` varchar(500) NOT NULL,
  `actions` text NOT NULL,
  `user` varchar(20) NOT NULL DEFAULT 'system',
  `lastexec` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `favoritDevices` varchar(200) NOT NULL DEFAULT '[]',
  `favoritVariables` varchar(200) NOT NULL DEFAULT '[]',
  `varChart` varchar(200) NOT NULL DEFAULT '[]',
  `variables` varchar(200) NOT NULL DEFAULT '[]',
  `admin` varchar(20) NOT NULL DEFAULT 'false',
  `chartHour` int(20) NOT NULL DEFAULT '24',
  `background` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

INSERT INTO `user` (`id`, `name`, `favoritDevices`, `favoritVariables`, `varChart`, `variables`, `admin`, `background`) VALUES (1, 'Admin', '[]', '[]','[]', '[]', 'true', '');


--
-- Tabellenstruktur für Tabelle `variable`
--

CREATE TABLE `variable` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL,
  `charttype` varchar(255) NOT NULL,
  `linetype` varchar(255) NOT NULL,
  `linecolor` varchar(255) NOT NULL,
  `suffix` varchar(10) NOT NULL,
  `error` varchar(255) NOT NULL,
  `step` varchar(20) NOT NULL DEFAULT 'false',
  `showall` varchar(20) NOT NULL DEFAULT 'false',
  `user` varchar(20) NOT NULL DEFAULT 'system',
  `lastChange` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `charttypen`
--
ALTER TABLE `charttypen`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `countdowns`
--
ALTER TABLE `countdowns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `countdowntypen`
--
ALTER TABLE `countdowntypen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`deviceid`),
  ADD UNIQUE KEY `deviceid` (`deviceid`);

--
-- Indizes für die Tabelle `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `linetypen`
--
ALTER TABLE `linetypen`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `messagetypen`
--
ALTER TABLE `messagetypen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `id_2` (`id`);

--
-- Indizes für die Tabelle `sensors`
--
ALTER TABLE `sensors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `stored_vars`
--
ALTER TABLE `stored_vars`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `timer`
--
ALTER TABLE `timer`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indizes für die Tabelle `variable`
--
ALTER TABLE `variable`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `charttypen`
--
ALTER TABLE `charttypen`
  MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT für Tabelle `countdowns`
--
ALTER TABLE `countdowns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `countdowntypen`
--
ALTER TABLE `countdowntypen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT für Tabelle `devices`
--
ALTER TABLE `devices`
  MODIFY `deviceid` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `linetypen`
--
ALTER TABLE `linetypen`
  MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
--
-- AUTO_INCREMENT für Tabelle `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `messagetypen`
--
ALTER TABLE `messagetypen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT für Tabelle `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `sensors`
--
ALTER TABLE `sensors`
  MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `stored_vars`
--
ALTER TABLE `stored_vars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `timer`
--
ALTER TABLE `timer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `variable`
--
ALTER TABLE `variable`
  MODIFY `uid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT;COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;