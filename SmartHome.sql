-- phpMyAdmin SQL Dump
-- version 4.2.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 16. Nov 2015 um 19:16
-- Server Version: 5.5.44-0+deb8u1
-- PHP-Version: 5.6.13-0+deb8u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `SmartHome`
--
CREATE DATABASE IF NOT EXISTS `SmartHomeee` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `SmartHomeee`;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `charttypen`
--

CREATE TABLE IF NOT EXISTS `charttypen` (
`id` bigint(11) NOT NULL,
  `chart` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `countdowns`
--

CREATE TABLE IF NOT EXISTS `countdowns` (
`id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  `switchid` int(11) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `countdowntypen`
--

CREATE TABLE IF NOT EXISTS `countdowntypen` (
`id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `devices`
--

CREATE TABLE IF NOT EXISTS `devices` (
`deviceid` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `name` varchar(40) NOT NULL,
  `protocol` int(11) NOT NULL,
  `buttonLabelOn` varchar(20) NOT NULL,
  `buttonLabelOff` varchar(20) NOT NULL,
  `CodeOn` varchar(200) NOT NULL,
  `CodeOff` varchar(200) NOT NULL,
  `roomid` int(11) NOT NULL,
  `switchserver` INT(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=17 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `groups`
--

CREATE TABLE IF NOT EXISTS `groups` (
`id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `devices` varchar(200) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `linetypen`
--

CREATE TABLE IF NOT EXISTS `linetypen` (
`id` bigint(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `line` varchar(20) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=12 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `messages`
--

CREATE TABLE IF NOT EXISTS `messages` (
`id` int(11) NOT NULL,
  `time` varchar(20) NOT NULL,
  `type` int(11) NOT NULL,
  `author` varchar(20) NOT NULL,
  `message` varchar(200) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=13 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `messagetypen`
--

CREATE TABLE IF NOT EXISTS `messagetypen` (
`id` int(11) NOT NULL,
  `type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `rooms`
--

CREATE TABLE IF NOT EXISTS `rooms` (
`id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sensors`
--

CREATE TABLE IF NOT EXISTS `sensors` (
`id` bigint(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `nodeid` varchar(255) NOT NULL,
  `charttype` varchar(255) NOT NULL,
  `linetype` varchar(255) NOT NULL,
  `linecolor` varchar(255) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sensor_data`
--

CREATE TABLE IF NOT EXISTS `sensor_data` (
`id` bigint(11) NOT NULL,
  `nodeid` varchar(20) NOT NULL,
  `time` varchar(20) NOT NULL,
  `temp` float NOT NULL,
  `hum` float NOT NULL,
  `supplyV` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=278403 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE IF NOT EXISTS `user` (
`id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `favoritDevices` varchar(200) NOT NULL,
  `background` varchar(500) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `charttypen`
--
ALTER TABLE `charttypen`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `countdowns`
--
ALTER TABLE `countdowns`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `countdowntypen`
--
ALTER TABLE `countdowntypen`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
 ADD PRIMARY KEY (`deviceid`), ADD UNIQUE KEY `deviceid` (`deviceid`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `linetypen`
--
ALTER TABLE `linetypen`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `messagetypen`
--
ALTER TABLE `messagetypen`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`), ADD KEY `id_2` (`id`);

--
-- Indexes for table `sensors`
--
ALTER TABLE `sensors`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `sensor_data`
--
ALTER TABLE `sensor_data`
 ADD PRIMARY KEY (`id`), ADD KEY `nodeid` (`nodeid`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `charttypen`
--
ALTER TABLE `charttypen`
MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `countdowns`
--
ALTER TABLE `countdowns`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `countdowntypen`
--
ALTER TABLE `countdowntypen`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
MODIFY `deviceid` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=17;
--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `linetypen`
--
ALTER TABLE `linetypen`
MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=12;
--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT for table `messagetypen`
--
ALTER TABLE `messagetypen`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `sensors`
--
ALTER TABLE `sensors`
MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `sensor_data`
--
ALTER TABLE `sensor_data`
MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=278403;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;

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

--
-- Daten für Tabelle `countdowntypen`
--

INSERT INTO `countdowntypen` (`id`, `type`) VALUES
(1, 'device'),
(2, 'room'),
(3, 'group');

--
-- Daten für Tabelle `messagetypen`
--

INSERT INTO `messagetypen` (`id`, `type`) VALUES
(1, 'Text'),
(2, 'Link');


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
