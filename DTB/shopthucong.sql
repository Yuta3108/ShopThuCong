-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th10 14, 2025 lúc 01:24 PM
-- Phiên bản máy phục vụ: 9.1.0
-- Phiên bản PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `shopthucong`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenKhachHang` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `sdt` varchar(15) DEFAULT NULL,
  `matKhau` varchar(255) NOT NULL,
  `diaChi` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` enum('admin','khachhang') DEFAULT 'khachhang',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `tenKhachHang`, `email`, `sdt`, `matKhau`, `diaChi`, `createdAt`, `role`) VALUES
(3, 'Admin Shop', 'admin@shopthucong.com', '0901234567', '$2b$10$fVErKqlmjk6BcllkopPi8emZFqdnfDJJd2yv.JE3.h0yIymMJiXYa', 'TP.HCM', '2025-10-14 12:49:05', 'admin'),
(2, 'Nguyen Van A', 'a@gmail.com', '0911222333', '$2b$10$u56rGuBRg4IT4U1aI2qsRe9QMRfX7SMPq7BSYofRI1./6hj9XE8Ey', 'Cần Thơ', '2025-10-14 12:48:00', 'khachhang'),
(4, 'Trần  Phong', '6@gmail.com', '0938217781', '$2b$10$zzEDLotgHQEoWQVIuOt5mOPm6/roNYgmIP9dpYt5BEecoGkQ12I46', '23/2 Hưng Phú p8 q8', '2025-10-14 13:01:06', 'khachhang'),
(5, 'Phong Thanh', '7@gmail.com', '0938217781', '$2b$10$2NaCpLi8C.hBoKmNOgR1U.eno7HtwIBDN6Z1bma6tN.3J0cECwGqC', '312312', '2025-10-14 13:14:05', 'khachhang');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
