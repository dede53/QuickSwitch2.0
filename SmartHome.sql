-- phpMyAdmin SQL Dump
-- version 4.2.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 12. Jun 2016 um 16:27
-- Server Version: 5.5.44-0+deb8u1
-- PHP-Version: 5.6.20-0+deb8u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Datenbank: `SmartHome`
--
CREATE DATABASE IF NOT EXISTS `SmartHome` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `SmartHome`;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `charttypen`
--

CREATE TABLE IF NOT EXISTS `charttypen` (
`id` bigint(11) NOT NULL,
  `chart` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `countdowns`
--

CREATE TABLE IF NOT EXISTS `countdowns` (
`id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `time` varchar(20) NOT NULL,
  `switchid` int(11) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `countdowntypen`
--

CREATE TABLE IF NOT EXISTS `countdowntypen` (
`id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `devices`
--

CREATE TABLE IF NOT EXISTS `devices` (
`deviceid` int(11) NOT NULL,
  `status` int(50) NOT NULL,
  `name` varchar(40) NOT NULL,
  `protocol` varchar(40) NOT NULL,
  `buttonLabelOn` varchar(20) NOT NULL,
  `buttonLabelOff` varchar(20) NOT NULL,
  `CodeOn` varchar(200) NOT NULL,
  `CodeOff` varchar(200) NOT NULL,
  `roomid` int(11) NOT NULL,
  `switchserver` int(11) NOT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'device'
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `groups`
--

CREATE TABLE IF NOT EXISTS `groups` (
`id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `devices` varchar(200) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `linetypen`
--

CREATE TABLE IF NOT EXISTS `linetypen` (
`id` bigint(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `line` varchar(20) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `messagetypen`
--

CREATE TABLE IF NOT EXISTS `messagetypen` (
`id` int(11) NOT NULL,
  `type` varchar(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `rooms`
--

CREATE TABLE IF NOT EXISTS `rooms` (
`id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;


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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `stored_vars`
--

CREATE TABLE IF NOT EXISTS `stored_vars` (
`id` int(11) NOT NULL,
  `nodeid` varchar(20) NOT NULL,
  `time` varchar(20) NOT NULL,
  `value` varchar(20) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `timer`
--

CREATE TABLE IF NOT EXISTS `timer` (
`id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `active` varchar(10) NOT NULL DEFAULT 'true',
  `variables` varchar(1000) NOT NULL,
  `conditions` varchar(500) NOT NULL,
  `actions` text NOT NULL,
  `user` varchar(20) NOT NULL DEFAULT 'system'
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE IF NOT EXISTS `user` (
`id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `favoritDevices` varchar(200) NOT NULL,
  `background` varchar(500) NOT NULL,
  `variables` varchar(200) NOT NULL DEFAULT '[]'
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `variable`
--

CREATE TABLE IF NOT EXISTS `variable` (
`id` int(11) NOT NULL,
  `nodeid` varchar(255) NOT NULL,
  `name` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `charttype` varchar(255) NOT NULL,
  `linetype` varchar(255) NOT NULL,
  `linecolor` varchar(255) NOT NULL,
  `suffix` varchar(10) NOT NULL,
  `error` varchar(255) NOT NULL,
  `step` varchar(20) NOT NULL DEFAULT 'false',
  `showall` varchar(20) NOT NULL DEFAULT 'false',
  `user` varchar(20) NOT NULL DEFAULT 'system'
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

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
-- Indexes for table `stored_vars`
--
ALTER TABLE `stored_vars`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `timer`
--
ALTER TABLE `timer`
 ADD PRIMARY KEY (`name`), ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `variable`
--
ALTER TABLE `variable`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`), ADD UNIQUE KEY `name` (`name`), ADD KEY `id_2` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `charttypen`
--
ALTER TABLE `charttypen`
MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `countdowns`
--
ALTER TABLE `countdowns`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `countdowntypen`
--
ALTER TABLE `countdowntypen`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
MODIFY `deviceid` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `linetypen`
--
ALTER TABLE `linetypen`
MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `messagetypen`
--
ALTER TABLE `messagetypen`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `sensors`
--
ALTER TABLE `sensors`
MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `stored_vars`
--
ALTER TABLE `stored_vars`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `timer`
--
ALTER TABLE `timer`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `variable`
--
ALTER TABLE `variable`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=0;

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
