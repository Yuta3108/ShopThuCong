-- =====================================================
-- SHOPTHUCONG - FULL CLEAN IMPORT (DB NEW)
-- Source: user-provided mysqldump snippet
-- Target: MySQL 8.0+ / phpMyAdmin import
-- =====================================================

/* 1) UTF8MB4 + Disable FK checks */
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 2) Create fresh database
DROP DATABASE IF EXISTS shopthucong;
CREATE DATABASE shopthucong
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE shopthucong;

-- =====================================================
-- DROP TABLES (reverse dependency order)
-- =====================================================
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `variant_attribute_values`;
DROP TABLE IF EXISTS `attribute_values`;
DROP TABLE IF EXISTS `images`;
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `vouchers`;
DROP TABLE IF EXISTS `attributes`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- =====================================================
-- CREATE TABLES (dependency order)
-- =====================================================

-- -------------------------
-- users
-- -------------------------
CREATE TABLE `users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `FullName` varchar(255) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Role` enum('customer','admin') DEFAULT 'customer',
  `Status` tinyint(1) DEFAULT '1',
  `Verified` tinyint DEFAULT '0',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resetToken` varchar(255) DEFAULT NULL,
  `resetExpires` datetime DEFAULT NULL,
  `verifyToken` varchar(255) DEFAULT NULL,
  `verifyExpires` datetime DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- categories
-- -------------------------
CREATE TABLE `categories` (
  `CategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(255) NOT NULL,
  `Description` text,
  `ImageURL` varchar(255) DEFAULT NULL,
  `ImagePublicID` varchar(255) DEFAULT NULL,
  `Slug` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- attributes
-- -------------------------
CREATE TABLE `attributes` (
  `AttributeID` int NOT NULL AUTO_INCREMENT,
  `AttributeName` varchar(100) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`AttributeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- products
-- -------------------------
CREATE TABLE `products` (
  `ProductID` int NOT NULL AUTO_INCREMENT,
  `CategoryID` int NOT NULL,
  `ProductCode` varchar(50) DEFAULT NULL,
  `ProductName` varchar(255) NOT NULL,
  `ShortDescription` text,
  `Material` varchar(255) DEFAULT NULL,
  `Description` text,
  `ImageURL` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ProductID`),
  UNIQUE KEY `SKU` (`ProductCode`),
  KEY `fk_products_categories` (`CategoryID`),
  CONSTRAINT `fk_products_categories`
    FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- product_variants
-- -------------------------
CREATE TABLE `product_variants` (
  `VariantID` int NOT NULL AUTO_INCREMENT,
  `ProductID` int NOT NULL,
  `ProductCode` varchar(50) DEFAULT NULL,
  `Price` decimal(18,2) NOT NULL,
  `StockQuantity` int NOT NULL DEFAULT '0',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`VariantID`),
  UNIQUE KEY `SKU` (`ProductCode`),
  KEY `fk_variants_products` (`ProductID`),
  CONSTRAINT `fk_variants_products`
    FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_price_positive` CHECK ((`Price` >= 0)),
  CONSTRAINT `chk_stock_positive` CHECK ((`StockQuantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- images
-- -------------------------
CREATE TABLE `images` (
  `ImageID` int NOT NULL AUTO_INCREMENT,
  `VariantID` int DEFAULT NULL,
  `ImageUrl` varchar(255) DEFAULT NULL,
  `PublicID` varchar(255) DEFAULT NULL,
  `DisplayOrder` int DEFAULT NULL,
  PRIMARY KEY (`ImageID`),
  KEY `fk_images_variants` (`VariantID`),
  CONSTRAINT `fk_images_variants`
    FOREIGN KEY (`VariantID`) REFERENCES `product_variants` (`VariantID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- attribute_values
-- -------------------------
CREATE TABLE `attribute_values` (
  `AttributeValueID` int NOT NULL AUTO_INCREMENT,
  `AttributeID` int NOT NULL,
  `Value` varchar(100) NOT NULL,
  PRIMARY KEY (`AttributeValueID`),
  KEY `fk_attr_values_attributes` (`AttributeID`),
  CONSTRAINT `fk_attr_values_attributes`
    FOREIGN KEY (`AttributeID`) REFERENCES `attributes` (`AttributeID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- variant_attribute_values
-- -------------------------
CREATE TABLE `variant_attribute_values` (
  `VariantID` int NOT NULL,
  `AttributeValueID` int NOT NULL,
  PRIMARY KEY (`VariantID`,`AttributeValueID`),
  KEY `fk_variant_attr_value` (`AttributeValueID`),
  CONSTRAINT `fk_variant_attr_value`
    FOREIGN KEY (`AttributeValueID`) REFERENCES `attribute_values` (`AttributeValueID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_variant_attr_variant`
    FOREIGN KEY (`VariantID`) REFERENCES `product_variants` (`VariantID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- carts
-- -------------------------
CREATE TABLE `carts` (
  `CartID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CartID`),
  UNIQUE KEY `unique_user_cart` (`UserID`),
  CONSTRAINT `fk_carts_users`
    FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- cart_items
-- -------------------------
CREATE TABLE `cart_items` (
  `CartItemID` int NOT NULL AUTO_INCREMENT,
  `CartID` int NOT NULL,
  `VariantID` int NOT NULL,
  `Quantity` int NOT NULL DEFAULT '1',
  `UnitPrice` decimal(18,2) NOT NULL,
  PRIMARY KEY (`CartItemID`),
  KEY `fk_cart_items_cart` (`CartID`),
  KEY `fk_cart_items_variant` (`VariantID`),
  CONSTRAINT `fk_cart_items_cart`
    FOREIGN KEY (`CartID`) REFERENCES `carts` (`CartID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_variant`
    FOREIGN KEY (`VariantID`) REFERENCES `product_variants` (`VariantID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- vouchers
-- -------------------------
CREATE TABLE `vouchers` (
  `VoucherID` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(50) NOT NULL,
  `Type` enum('fixed','percent') NOT NULL,
  `DiscountValue` decimal(10,2) NOT NULL,
  `MinOrder` decimal(10,2) DEFAULT '0.00',
  `MaxDiscount` decimal(10,2) DEFAULT NULL,
  `Quantity` int NOT NULL DEFAULT '999',
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  `Status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`VoucherID`),
  UNIQUE KEY `Code` (`Code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- orders
-- -------------------------
CREATE TABLE `orders` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `ReceiverName` varchar(255) NOT NULL,
  `Phone` varchar(15) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `ShippingAddress` varchar(255) NOT NULL,
  `PaymentMethod` varchar(100) NOT NULL,
  `Total` decimal(18,2) NOT NULL,
  `Status` enum('pending','processing','shipping','completed','cancelled') NOT NULL DEFAULT 'pending',
  `Note` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `VoucherCode` varchar(50) DEFAULT NULL,
  `Discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ShippingFee` varchar(50) DEFAULT NULL,
  `ShippingMethod` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`OrderID`),
  KEY `fk_orders_users` (`UserID`),
  CONSTRAINT `fk_orders_users`
    FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- order_items
-- -------------------------
CREATE TABLE `order_items` (
  `OrderItemID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int NOT NULL,
  `VariantID` int NOT NULL,
  `ProductName` varchar(255) NOT NULL,
  `Quantity` int NOT NULL,
  `UnitPrice` decimal(18,2) NOT NULL,
  `TotalPrice` decimal(18,2) NOT NULL,
  PRIMARY KEY (`OrderItemID`),
  KEY `fk_order_items_orders` (`OrderID`),
  KEY `fk_order_items_variants` (`VariantID`),
  CONSTRAINT `fk_order_items_orders`
    FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_variants`
    FOREIGN KEY (`VariantID`) REFERENCES `product_variants` (`VariantID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT DATA (as provided)
-- =====================================================

-- users
INSERT INTO `users` VALUES
(1,'b@gmail.com','$2b$10$M5tPA5QS.5l32bL5GRbyVuFAN/agzNetHPJdEXXfLaI00qDuaqEXy','Nguyễn Văn B','0901234567','TP.HCM','admin',1,1,'2025-10-27 16:04:51','2025-12-01 11:33:20',NULL,NULL,NULL,NULL),
(2,'b1@gmail.com','$2b$10$Hz/opFOlEKwmWAkgkUjSpObglpOeWQFgc8RAsiFVW4rGFc0neF7RO','Nguyễn Văn C','0901234567','TP.HCM','customer',1,1,'2025-10-27 16:24:34','2025-12-01 14:55:38',NULL,NULL,NULL,NULL),
(3,'6@gmail.com','$2b$10$nelamqg7NCYlvBVbl2UpGOF9T55EhVuHkv2K16rottSdQnd3lWIsu','Trần  Phong','0938217781','TPHCM','customer',1,1,'2025-10-27 16:24:40','2025-12-01 11:33:20',NULL,NULL,NULL,NULL),
(4,'toyo@gmail.com','$2b$10$..2UWZVulpqn/EhjAJ3MsOP9pTJoc9Qn7ZspuUDI6dU/HYyo0pYkC','Trần Phong','0938217782','Tp Hcm','customer',1,1,'2025-10-30 11:48:26','2025-12-01 11:33:20',NULL,NULL,NULL,NULL),
(5,'toyotran0@gmail.com','$2b$10$iPi8q4rYHymLletK74OoKuYfStdHIS9DFrXmsKvO/biFPjo4JHnwW','Trần Phong','0938217781','23/2 Trần Văn Thành Phường Chánh Hưng','customer',1,1,'2025-11-02 17:12:16','2026-01-03 13:28:12',NULL,NULL,NULL,NULL),
(6,'quockhanh.1645@gmail.com','$2b$10$SLAmUizq9wnlqCSCUJ0LeOpYGhP.pv4efveZNTrC9ftusE/9aEtJO','Trần Khánh','09999123132','HCM','customer',1,1,'2025-11-02 17:35:32','2025-12-01 11:33:20',NULL,NULL,NULL,NULL),
(24,'hausaidan451@gmail.com','$2b$10$jTVml0IAGvkEXHF5cIouGOoGPS1VMS.0m4ogelUUWqY4GK4HxH2C6','Nguyen  Hau','0993921004','2132 Bong Sao P5,Q8','customer',1,1,'2025-12-09 19:39:17','2025-12-15 17:30:30',NULL,NULL,NULL,NULL);

-- categories
INSERT INTO `categories` VALUES
(1,'Dụng Cụ Đan Móc','Các loại dụng cụ phục vụ đan móc len sợi.','https://res.cloudinary.com/dwijpevo4/image/upload/v1766239949/categories/p8jxfvkoawpkdfez5hp8.jpg','categories/p8jxfvkoawpkdfez5hp8','dung-cu-dan-moc','2025-10-30 07:27:28'),
(2,'Phụ Kiện Túi Xách','Phụ kiện trang trí và linh kiện túi xách.','https://res.cloudinary.com/dwijpevo4/image/upload/v1766239992/categories/ou0bdzbsbcilylmjdffm.jpg','categories/ou0bdzbsbcilylmjdffm','phu-kien-tui-xach','2025-10-30 07:27:28'),
(3,'Phụ Kiện Trang Trí','Phụ Kiện trang trí cho sản phẩm handmade.','https://res.cloudinary.com/dwijpevo4/image/upload/v1766239973/categories/e9lazzisvqrt4wrjbvx7.jpg','categories/e9lazzisvqrt4wrjbvx7','phu-kien-trang-tri','2025-10-30 07:27:28'),
(4,'Phụ Kiện Thú Bông','Nguyên liệu cho thú bông, móc khóa.','https://res.cloudinary.com/dwijpevo4/image/upload/v1766239961/categories/z5usmhz6xjruakol4lzy.jpg','categories/z5usmhz6xjruakol4lzy','phu-kien-thu-bong','2025-10-30 07:27:28'),
(5,'Combo Quà Tặng','Các combo dụng cụ, phụ kiện làm quà tặng.','https://res.cloudinary.com/dwijpevo4/image/upload/v1766239932/categories/w7iqfqjykeh6xv2bzbdb.jpg','categories/w7iqfqjykeh6xv2bzbdb','combo-qua-tang','2025-10-30 07:27:28'),
(6,'Sản Phẩm Tiết Kiệm','Các sản phẩm có giá ưu đãi, tiết kiệm chi phí.','https://res.cloudinary.com/dwijpevo4/image/upload/v1766240008/categories/sofxjuu3gfrorv0istf5.jpg','categories/sofxjuu3gfrorv0istf5','san-pham-tiet-kiem','2025-10-30 07:27:28');

-- attributes
INSERT INTO `attributes` VALUES
(1,'Màu sắc',NULL),
(2,'Kích thước',NULL);

-- products
INSERT INTO `products` VALUES
(1,1,'DCM-001','Bộ Kim Móc Len Kim Loại','Bộ kim móc 10 cây, nhiều kích cỡ','Kim loại','Phù hợp cho người mới học đan len.','https://res.cloudinary.com/dwijpevo4/image/upload/v1762762016/shopthucong/products/ju1fbxgr39j1ckzvizrh.jpg','2025-10-30 07:32:27','2025-11-10 08:06:57',1),
(2,1,'DCM-002','Thước Đo Len Nhựa','Thước đo kích thước len tiện dụng','Nhựa','Dùng để đo đường kính kim hoặc len','https://res.cloudinary.com/dwijpevo4/image/upload/v1762762029/shopthucong/products/ns5h23bgscolgymb5pcg.jpg','2025-10-30 07:32:27','2025-11-10 08:07:10',1),
(3,1,'DCM-003','Kéo Mini Cắt Len','Kéo nhỏ sắc bén, cắt len dễ dàng','Thép','Phù hợp cho mọi loại len.','https://res.cloudinary.com/dwijpevo4/image/upload/v1762762043/shopthucong/products/jb7vs4kleqaeujst4yoy.png','2025-10-30 07:32:27','2025-11-10 08:07:23',1),
(4,4,'PKTB-001','Mắt Thú Bông Nhựa Đen','Mắt nhựa đen an toàn cho thú bông','Nhựa','Dành cho thú bông handmade, nhiều kích cỡ','https://res.cloudinary.com/dwijpevo4/image/upload/v1762762053/shopthucong/products/zrg6oardlnzgftrgwm40.jpg','2025-10-30 07:32:27','2025-11-15 19:31:41',1),
(5,4,'PKTB-002','Mũi Thú Bông Hình Tam Giác','Mũi nhựa màu đen, tam giác','Nhựa','Dễ gắn vào sản phẩm, an toàn','https://res.cloudinary.com/dwijpevo4/image/upload/v1762762088/shopthucong/products/csib108du6j12lvskktg.jpg','2025-10-30 07:32:27','2025-11-15 19:31:57',1),
(6,3,'PKTT-001','Nút Hoa Trang Trí','Nút gỗ hoa nhỏ xinh','Gỗ','Dùng để may áo, túi, hoặc làm thiệp handmade','https://res.cloudinary.com/dwijpevo4/image/upload/v1762762135/shopthucong/products/dzuuf7itahkwg3b0n7sz.png','2025-10-30 07:32:27','2025-11-10 08:08:56',1),
(7,3,'PKTT-002','Ruy Băng Trang Trí','Ruy băng lụa mềm, nhiều màu','Vải','Trang trí hộp quà, scrapbook, sổ tay','https://res.cloudinary.com/dwijpevo4/image/upload/v1762762145/shopthucong/products/sknfdxkhlyzcgo0wpetv.jpg','2025-10-30 07:32:27','2025-11-10 08:09:08',1),
(8,2,'PKTX-001','Khóa Cài Túi Xách Tròn','Khóa tròn nhỏ màu bạc','Kim loại','Phù hợp với túi handmade.','https://res.cloudinary.com/dwijpevo4/image/upload/v1762762158/shopthucong/products/s3g7udt181btkadmqyce.jpg','2025-10-30 07:32:27','2025-11-15 19:32:07',1),
(10,6,'SPTK-001','Bộ Kim Chỉ May Mini','Bộ may vá mini tiện lợi','Thép','Bao gồm kim, chỉ, kéo, thước.','https://res.cloudinary.com/dwijpevo4/image/upload/v1762627561/shopthucong/products/rkirhiauemdzvxynwaao.jpg','2025-10-30 07:32:28','2025-12-28 13:22:35',1),
(11,6,'SPTK-002','Kéo Cắt Giấy Mini','Kéo nhỏ sắc bén','Thép','Dành cho học sinh, sinh viên.','https://res.cloudinary.com/dwijpevo4/image/upload/v1762762001/shopthucong/products/dwhfpdyxop7gdtteckru.jpg','2025-10-30 07:32:28','2025-12-10 09:22:47',1),
(16,5,'CBQT-001','Combo Quà Tặng Cơ Bản','quà tặng phổ thông, giá mềm','Tổng Hợp','Combo Quà Tặng Cơ Bản bao gồm :\nHộp quà giấy cứng\nSữa tắm mini\n\nXà phòng handmade\nNến thơm mini\nThiệp chúc mừng','https://res.cloudinary.com/dwijpevo4/image/upload/v1766925515/shopthucong/products/zsrvnnimp1gsyq38szob.webp','2025-12-28 12:38:35','2025-12-28 12:38:35',1),
(17,5,'CBQT-002','Combo Quà Tặng Handmade','Combo Quà Tặng Handmade','Tổng Hợp','Combo Quà Tặng Handmade Gồm :\nXà phòng handmade\nNến thơm handmade\nTúi thơm thảo mộc\nHộp kraft / hộp gỗ\nThiệp viết tay','https://res.cloudinary.com/dwijpevo4/image/upload/v1766926420/shopthucong/products/ifu0ezyyabkbadtd74iz.webp','2025-12-28 12:53:41','2025-12-28 12:53:41',1),
(18,5,'CBQT-003','Combo Quà Tặng Cao Cấp','Combo Quà Tặng Cao Cấp','Tổng Hợp','Combo Quà Tặng Cao Cấp Gồm :\nHộp quà cao cấp nam châm\nNến thơm cao cấp\nNước hoa mini / trà thảo mộc\nPhụ kiện trang trí\nThiệp sang trọng','https://res.cloudinary.com/dwijpevo4/image/upload/v1766927211/shopthucong/products/tnoyuur7igfqwyqxs6f7.webp','2025-12-28 13:06:51','2025-12-28 13:06:51',1),
(20,2,'PKTX-002','Dây Đeo Túi Xách Thay Thế','Dây đeo túi xách có thể thay thế, điều chỉnh độ dài linh hoạt.','Da PU / Vải dù','Dây đeo túi xách có thể thay thế, điều chỉnh độ dài linh hoạt.','https://res.cloudinary.com/dwijpevo4/image/upload/v1766927645/shopthucong/products/oig9qoghdsvwrbuorw5w.jpg','2025-12-28 13:14:06','2026-01-05 13:41:20',1),
(21,2,'PKTX-003','Móc Treo Túi Xách Gấp Gọn','Móc treo túi gấp gọn, tiện lợi khi đi cà phê, văn phòng.','Hợp Kim','Móc treo túi gấp gọn, tiện lợi khi đi cà phê, văn phòng.','https://res.cloudinary.com/dwijpevo4/image/upload/v1766927961/shopthucong/products/g2rvabma6qfwsajonfzo.jpg','2025-12-28 13:19:22','2025-12-28 13:19:22',1);

-- product_variants
INSERT INTO `product_variants` VALUES
(1,1,'DCM-001-1',25000.00,10,1,'2025-10-30 07:32:27','2025-12-26 03:21:46'),
(2,1,'DCM-001-2',27000.00,8,1,'2025-10-30 07:32:27','2025-12-26 14:33:49'),
(3,2,'DCM-002-1',18000.00,17,1,'2025-10-30 07:32:27','2026-01-05 16:32:59'),
(5,3,'DCM-003-1',30000.00,28,1,'2025-10-30 07:32:27','2025-12-26 03:21:46'),
(6,4,'PKTB-001-1',5000.00,99,1,'2025-10-30 07:32:27','2025-12-10 19:08:19'),
(8,5,'PKTB-002-1',6000.00,70,1,'2025-10-30 07:32:27','2025-11-15 19:31:57'),
(9,5,'PKTB-002-2',6500.00,50,1,'2025-10-30 07:32:27','2025-11-15 19:31:59'),
(10,6,'PKTT-001-1',10000.00,29,1,'2025-10-30 07:32:27','2025-12-15 15:27:27'),
(12,7,'PKTT-002-1',15000.00,35,1,'2025-10-30 07:32:27','2025-12-15 15:48:16'),
(14,8,'PKTX-001-1',20000.00,43,1,'2025-10-30 07:32:28','2025-12-18 18:19:31'),
(18,10,'SPTK-001-1',123000.00,13,1,'2025-10-30 07:32:28','2025-12-28 13:22:35'),
(20,11,'SPTK-002-1',12000.00,55,1,'2025-10-30 07:32:28','2025-12-26 14:18:23'),
(21,11,'SPTK-002-2',13000.00,63,1,'2025-10-30 07:32:28','2025-12-26 14:36:12'),
(22,4,'PKTB-001-3',7000.00,100,1,'2025-10-30 07:58:49','2025-11-15 19:31:43'),
(23,4,'PKTB-001-4',8000.00,100,1,'2025-10-30 07:58:51','2025-11-15 19:31:45'),
(31,16,'CBQT-001-1',100000.00,10,1,'2025-12-28 12:38:35','2025-12-28 12:38:35'),
(32,17,'CBQT-002-1',70000.00,119,1,'2025-12-28 12:53:42','2026-01-05 13:48:21'),
(33,18,'CBQT-003-1',240000.00,18,1,'2025-12-28 13:06:52','2026-01-05 17:03:04'),
(34,20,'PKTX-002-1',100000.00,330,1,'2025-12-28 13:14:06','2026-01-05 14:20:13'),
(35,21,'PKTX-003-1',50000.00,26,1,'2025-12-28 13:19:22','2026-01-05 17:06:55'),
(36,21,'PKTX-003-2',100000.00,30,1,'2025-12-28 13:19:23','2025-12-28 13:19:23');

-- images
INSERT INTO `images` VALUES
(1,18,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810355/shopthucong/public/tzahhmkutycgwojvyphv.jpg','shopthucong/public/tzahhmkutycgwojvyphv',1),
(2,20,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810420/shopthucong/public/osvl43eajd6lu8zqv9y2.jpg','shopthucong/public/osvl43eajd6lu8zqv9y2',1),
(3,21,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810421/shopthucong/public/j9cmapgf8qirppbql9dc.jpg','shopthucong/public/j9cmapgf8qirppbql9dc',1),
(4,1,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810521/shopthucong/public/gk7ss3qkcbrs7nsn1wfw.jpg','shopthucong/public/gk7ss3qkcbrs7nsn1wfw',1),
(5,2,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810522/shopthucong/public/nytayp9aymifepxnkm8s.jpg','shopthucong/public/nytayp9aymifepxnkm8s',1),
(6,3,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810978/shopthucong/public/etz9yxtiohoh6qivph0g.jpg','shopthucong/public/etz9yxtiohoh6qivph0g',1),
(7,5,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811032/shopthucong/public/uayyr9fzcwx4dew6sis4.png','shopthucong/public/uayyr9fzcwx4dew6sis4',1),
(8,6,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811128/shopthucong/public/berrlasyrouotodepktl.jpg','shopthucong/public/berrlasyrouotodepktl',1),
(9,22,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811131/shopthucong/public/gyiyfybtboxllybnhlow.jpg','shopthucong/public/gyiyfybtboxllybnhlow',1),
(10,23,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811133/shopthucong/public/yl3yv1nftenrxgvhfs7v.jpg','shopthucong/public/yl3yv1nftenrxgvhfs7v',1),
(11,8,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811609/shopthucong/public/rw0iavtyai0xnht0lhlv.jpg','shopthucong/public/rw0iavtyai0xnht0lhlv',1),
(12,9,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811611/shopthucong/public/xqhzdrvgr7w6yostbnn9.jpg','shopthucong/public/xqhzdrvgr7w6yostbnn9',1),
(13,10,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811711/shopthucong/public/lh7easxeo5xy5tt3agcl.png','shopthucong/public/lh7easxeo5xy5tt3agcl',1),
(14,12,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811744/shopthucong/public/ovgg5m0bzzw6o04dwtjk.jpg','shopthucong/public/ovgg5m0bzzw6o04dwtjk',1),
(15,14,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811792/shopthucong/public/pssmohvkbaxho51nc8nv.jpg','shopthucong/public/pssmohvkbaxho51nc8nv',1),
(36,31,'https://res.cloudinary.com/dwijpevo4/image/upload/v1766925518/shopthucong/variants/hatlte8no9lx9lazpaco.webp','shopthucong/variants/hatlte8no9lx9lazpaco',1),
(37,32,'https://res.cloudinary.com/dwijpevo4/image/upload/v1766926424/shopthucong/variants/uy8sdlv7cws4mnv4dqj4.webp','shopthucong/variants/uy8sdlv7cws4mnv4dqj4',1),
(38,33,'https://res.cloudinary.com/dwijpevo4/image/upload/v1766927214/shopthucong/variants/ks01bus2vt5ga7696zze.webp','shopthucong/variants/ks01bus2vt5ga7696zze',1),
(39,34,'https://res.cloudinary.com/dwijpevo4/image/upload/v1766927648/shopthucong/variants/njl5bzlgsgfwjbxh4aq5.jpg','shopthucong/variants/njl5bzlgsgfwjbxh4aq5',1),
(40,35,'https://res.cloudinary.com/dwijpevo4/image/upload/v1766927963/shopthucong/variants/zqptinljhdgp954wos8q.jpg','shopthucong/variants/zqptinljhdgp954wos8q',1),
(41,36,'https://res.cloudinary.com/dwijpevo4/image/upload/v1766927964/shopthucong/variants/aok1ia7dzdu5x6st4o8i.jpg','shopthucong/variants/aok1ia7dzdu5x6st4o8i',1);

-- carts
INSERT INTO `carts` VALUES
(1,1,'2025-11-21 15:53:18','2025-11-21 15:53:18'),
(2,5,'2025-11-21 15:58:20','2025-11-21 15:58:20'),
(5,24,'2025-12-09 19:41:55','2025-12-09 19:41:55');

-- cart_items
INSERT INTO `cart_items` VALUES
(153,1,34,3,100000.00);

-- orders
INSERT INTO `orders` VALUES
(5,1,'Nguyễn Văn B','0901234567','b@gmail.com','TP.HCM','cod',114000.00,'completed',NULL,'2025-11-27 18:05:29','2025-12-29 11:31:28','Giam20K',20000.00,'0','standard'),
(8,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','cod',40000.00,'cancelled',NULL,'2025-12-02 09:00:13','2025-12-21 19:55:31','GIAM20K',0.00,'0','standard'),
(9,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','cod',38000.00,'completed',NULL,'2025-12-02 09:09:10','2025-12-29 11:32:26',NULL,0.00,'0','standard'),
(14,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','cod',155000.00,'completed',NULL,'2025-12-02 10:28:44','2025-12-21 19:55:31','GIAM20K',20000.00,'0','standard'),
(15,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','cod',10000.00,'completed',NULL,'2025-12-02 10:31:57','2025-12-21 19:55:31','GIAM10K',10000.00,'0','standard'),
(16,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','cod',84000.00,'completed',NULL,'2025-12-04 14:34:27','2025-12-21 19:55:31','GIAM10K',10000.00,'0','standard'),
(50,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',25000.00,'cancelled',NULL,'2025-12-10 18:39:11','2025-12-21 19:55:31',NULL,0.00,'0','standard'),
(53,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','cod',2000000.00,'cancelled',NULL,'2025-12-11 13:46:31','2025-12-21 19:55:31','GIAM30k',0.00,'0','standard'),
(55,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',9600.00,'completed',NULL,'2025-12-11 13:53:59','2025-12-29 11:43:48','GIAM20%',2400.00,'0','standard'),
(57,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',26000.00,'completed',NULL,'2025-12-13 04:40:26','2025-12-29 11:43:15','GIAM10K',0.00,'0','standard'),
(58,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',14000.00,'completed',NULL,'2025-12-15 12:23:49','2025-12-29 11:43:29','GIAM10K',10000.00,'0','standard'),
(63,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','cod',-5000.00,'cancelled',NULL,'2025-12-15 14:18:28','2025-12-21 19:55:31','Giam20%',20000.00,'0','standard'),
(64,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',25000.00,'cancelled',NULL,'2025-12-15 14:19:55','2025-12-21 19:55:31',NULL,0.00,'0','standard'),
(65,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',2000000.00,'cancelled',NULL,'2025-12-15 14:26:28','2025-12-21 19:55:31',NULL,0.00,'0','standard'),
(66,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',50000.00,'cancelled',NULL,'2025-12-15 14:28:23','2025-12-21 19:55:31',NULL,0.00,'0','standard'),
(67,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',18000.00,'cancelled',NULL,'2025-12-15 14:32:40','2025-12-21 19:55:31',NULL,0.00,'0','standard'),
(68,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',2000000.00,'cancelled',NULL,'2025-12-15 14:36:57','2025-12-21 19:55:31',NULL,0.00,'0','standard'),
(69,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',12000.00,'cancelled',NULL,'2025-12-15 14:39:04','2025-12-21 19:55:31',NULL,0.00,'0','standard'),
(70,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',2000000.00,'cancelled',NULL,'2025-12-15 14:42:24','2026-01-04 15:53:46',NULL,0.00,'0','standard'),
(71,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',12000.00,'completed',NULL,'2025-12-15 15:15:42','2025-12-29 11:48:03',NULL,0.00,'0','standard'),
(73,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',20000.00,'completed',NULL,'2025-12-15 15:19:06','2025-12-29 11:29:18',NULL,0.00,'0','standard'),
(75,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',20000.00,'completed',NULL,'2025-12-15 15:28:58','2025-12-29 11:30:04',NULL,0.00,'0','standard'),
(76,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',12000.00,'completed',NULL,'2025-12-15 15:32:10','2025-12-29 11:47:42',NULL,0.00,'0','standard'),
(77,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',2000000.00,'processing',NULL,'2025-12-15 15:34:46','2025-12-21 19:55:31',NULL,0.00,'0','standard'),
(78,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',15000.00,'completed',NULL,'2025-12-15 15:48:15','2025-12-29 11:34:46',NULL,0.00,'0','standard'),
(79,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',2000000.00,'completed',NULL,'2025-12-15 15:58:54','2025-12-29 11:19:21',NULL,0.00,'0','standard'),
(80,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','zalopay',2000000.00,'completed',NULL,'2025-12-15 16:04:11','2025-12-29 11:03:19',NULL,0.00,'0','standard'),
(82,5,'Trần Phong','0938217781','toyotran0@gmail.com','HCM','cod',35000.00,'completed',NULL,'2025-12-18 18:19:30','2025-12-29 11:03:16','GIAM10K',10000.00,'0','standard'),
(104,1,'Nguyễn Văn B','0901234567','b@gmail.com','22, Xã Phước Thể, Huyện Tuy Phong','zalopay',32500.00,'completed','giao nhanh','2025-12-21 19:48:35','2025-12-29 11:03:14',NULL,0.00,'20500','standard'),
(108,5,'Trần Phong','0938217781','toyotran0@gmail.com','123, Xã Khánh Thuận, Huyện U Minh','cod',54500.00,'completed',NULL,'2025-12-26 14:33:49','2025-12-29 11:28:27','GIAM20K',20000.00,'20500','standard'),
(109,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Vĩnh Phú Đông, Huyện Phước Long','zalopay',41300.00,'completed',NULL,'2025-12-26 14:36:11','2025-12-29 11:35:04','GIAM20%',5200.00,'20500','standard'),
(110,1,'Nguyễn Văn B','0901234567','b@gmail.com','32, Xã Khánh Tiến, Huyện U Minh','zalopay',34900.00,'completed',NULL,'2025-12-26 14:54:52','2025-12-29 11:03:11','GIAM20%',3600.00,'20500','standard'),
(111,5,'Trần Phong','0938217781','toyotran0@gmail.com','23/2 Trần văn thành , Phường 8, Quận 8','zalopay',262000.00,'completed',NULL,'2025-12-29 02:26:26','2025-12-29 11:03:08',NULL,0.00,'22000','standard'),
(112,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Điền Hải, Huyện Đông Hải','cod',120500.00,'completed',NULL,'2025-12-29 05:43:54','2025-12-29 11:34:00',NULL,0.00,'20500','standard'),
(113,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Viên An, Huyện Ngọc Hiển','cod',120500.00,'pending',NULL,'2025-12-29 16:55:30','2025-12-29 16:55:30',NULL,0.00,'20500','standard'),
(114,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Viên An Đông, Huyện Ngọc Hiển','cod',70500.00,'pending',NULL,'2025-12-29 17:10:17','2025-12-29 17:10:17',NULL,0.00,'20500','standard'),
(115,5,'Trần Phong','0938217781','toyotran0@gmail.com','3, Xã Vĩnh Phú Tây, Huyện Phước Long','cod',260500.00,'pending',NULL,'2025-12-29 17:11:57','2025-12-29 17:11:57',NULL,0.00,'20500','standard'),
(116,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Khánh Thuận, Huyện U Minh','cod',120500.00,'pending',NULL,'2025-12-29 17:16:19','2025-12-29 17:16:19',NULL,0.00,'20500','standard'),
(117,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Vĩnh Phú Tây, Huyện Phước Long','cod',260500.00,'pending',NULL,'2025-12-29 17:23:25','2025-12-29 17:23:25',NULL,0.00,'20500','standard'),
(118,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Khánh Tiến, Huyện U Minh','cod',110500.00,'pending',NULL,'2025-12-29 17:25:21','2025-12-29 17:25:21','GIAM10K',10000.00,'20500','standard'),
(119,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Phong Lạc, Huyện Trần Văn Thời','cod',260500.00,'pending',NULL,'2025-12-29 17:25:56','2025-12-29 17:25:56',NULL,0.00,'20500','standard'),
(120,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Vĩnh Hưng, Huyện Vĩnh Lợi','cod',120500.00,'shipping',NULL,'2025-12-29 17:26:30','2025-12-30 01:56:53',NULL,0.00,'20500','standard'),
(121,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Nguyễn Phích, Huyện U Minh','zalopay',110500.00,'processing',NULL,'2025-12-29 17:27:30','2025-12-29 17:28:08','GIAM10K',10000.00,'20500','standard'),
(122,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Khánh Tiến, Huyện U Minh','zalopay',230500.00,'processing',NULL,'2025-12-29 17:28:41','2025-12-29 17:29:24','GIAM20%',30000.00,'20500','standard'),
(123,5,'Trần Phong','0938217781','toyotran0@gmail.com','22, Xã Viên An, Huyện Ngọc Hiển','zalopay',60500.00,'cancelled',NULL,'2026-01-02 17:18:08','2026-01-05 16:32:29','GIAM10K',10000.00,'20500','standard'),
(124,5,'Trần Phong','0938217781','toyotran0@gmail.com','22, Xã Viên An Đông, Huyện Ngọc Hiển','zalopay',110500.00,'cancelled',NULL,'2026-01-02 17:27:28','2026-01-05 16:32:29','GIAM10K',10000.00,'20500','standard'),
(125,1,'Nguyễn Văn B','0901234567','b@gmail.com','22, Xã Vĩnh Phú Đông, Huyện Phước Long','zalopay',260500.00,'completed',NULL,'2026-01-02 17:30:08','2026-01-03 13:22:23',NULL,0.00,'20500','standard'),
(126,1,'Nguyễn Văn B','0901234567','b@gmail.com','22, Xã Phong Điền, Huyện Trần Văn Thời','zalopay',120500.00,'completed',NULL,'2026-01-02 17:38:08','2026-01-03 13:22:06',NULL,0.00,'20500','standard'),
(127,1,'Nguyễn Văn B','0901234567','b@gmail.com','22, Xã Vĩnh Hưng, Huyện Vĩnh Lợi','zalopay',260500.00,'completed',NULL,'2026-01-02 17:47:12','2026-01-03 12:58:13',NULL,0.00,'20500','standard'),
(128,5,'Trần Phong','0938217781','toyotran0@gmail.com','23, Xã Tân Phú, Thị xã Long Mỹ','zalopay',110500.00,'cancelled',NULL,'2026-01-03 13:29:09','2026-01-05 16:32:29','GIAM10K',10000.00,'20500','standard'),
(129,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Vĩnh Hưng A, Huyện Vĩnh Lợi','zalopay',250500.00,'cancelled',NULL,'2026-01-03 13:44:43','2026-01-05 16:32:29','GIAM10K',10000.00,'20500','standard'),
(130,1,'Nguyễn Văn B','0901234567','b@gmail.com','22, Xã Khánh Tiến, Huyện U Minh','zalopay',38500.00,'cancelled',NULL,'2026-01-04 14:50:16','2026-01-05 16:32:29',NULL,0.00,'20500','standard'),
(131,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Khánh Thuận, Huyện U Minh','zalopay',120500.00,'cancelled',NULL,'2026-01-04 15:26:00','2026-01-05 16:32:29',NULL,0.00,'20500','standard'),
(132,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Khánh Tiến, Huyện U Minh','zalopay',120500.00,'processing',NULL,'2026-01-05 13:42:41','2026-01-05 13:43:33','GIAM10K',0.00,'20500','standard'),
(133,1,'Nguyễn Văn B','0901234567','b@gmail.com','22, Xã Phong Điền, Huyện Trần Văn Thời','zalopay',90500.00,'processing',NULL,'2026-01-05 13:48:20','2026-01-05 13:48:51',NULL,0.00,'20500','standard'),
(134,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Ngũ Phụng, Huyện đảo Phú Quý','zalopay',70500.00,'processing',NULL,'2026-01-05 13:51:32','2026-01-05 13:52:03',NULL,0.00,'20500','standard'),
(135,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Khánh Thuận, Huyện U Minh','zalopay',120500.00,'cancelled',NULL,'2026-01-05 13:52:58','2026-01-05 16:32:29','GIAM10K',0.00,'20500','standard'),
(136,1,'Nguyễn Văn B','0901234567','b@gmail.com','22, Xã Khánh Tiến, Huyện U Minh','zalopay',500500.00,'cancelled',NULL,'2026-01-05 14:09:35','2026-01-05 16:32:29','GIAM10K',0.00,'20500','standard'),
(137,1,'Nguyễn Văn B','0901234567','b@gmail.com','22, Xã Ninh Thạnh Lợi A, Huyện Hồng Dân','zalopay',120500.00,'cancelled',NULL,'2026-01-05 14:20:11','2026-01-05 16:32:29','GIAM10K',0.00,'20500','standard'),
(138,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Phong Điền, Huyện Trần Văn Thời','zalopay',260500.00,'cancelled',NULL,'2026-01-05 14:40:48','2026-01-05 16:32:29','GIAM10K',0.00,'20500','standard'),
(139,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Lợi An, Huyện Trần Văn Thời','zalopay',260500.00,'cancelled',NULL,'2026-01-05 16:26:26','2026-01-05 16:41:29','GIAM10K',0.00,'20500','standard'),
(140,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Khánh Lộc, Huyện Trần Văn Thời','zalopay',38500.00,'cancelled',NULL,'2026-01-05 16:32:59','2026-01-05 16:48:29','GIAM10K',0.00,'20500','standard'),
(141,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Lợi An, Huyện Trần Văn Thời','zalopay',70500.00,'cancelled',NULL,'2026-01-05 16:51:44','2026-01-05 16:55:12','GIAM10K',0.00,'20500','standard'),
(142,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Đông Thạnh, Huyện Châu Thành','zalopay',260500.00,'cancelled',NULL,'2026-01-05 16:58:20','2026-01-05 16:59:17','GIAM10K',0.00,'20500','standard'),
(143,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Phú An, Huyện Châu Thành','zalopay',260500.00,'cancelled',NULL,'2026-01-05 17:02:09','2026-01-05 17:03:05','GIAM10K',0.00,'20500','standard'),
(144,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Lợi An, Huyện Trần Văn Thời','zalopay',70500.00,'cancelled',NULL,'2026-01-05 17:04:52','2026-01-05 17:05:47','GIAM10K',0.00,'20500','standard'),
(145,1,'Nguyễn Văn B','0901234567','b@gmail.com','23, Xã Phong Thạnh Đông, Thị Xã Giá Rai','zalopay',70500.00,'processing',NULL,'2026-01-05 17:06:54','2026-01-05 17:07:34','GIAM10K',0.00,'20500','standard');

-- order_items
INSERT INTO `order_items` VALUES
(9,5,3,'Thước Đo Len Nhựa',3,18000.00,54000.00),
(10,5,14,'Khóa Cài Túi Xách Tròn',1,20000.00,20000.00),
(11,5,18,'Bộ Kim Chỉ May Mini',3,20000.00,60000.00),
(16,8,18,'Bộ Kim Chỉ May Mini',2,20000.00,40000.00),
(17,9,18,'Bộ Kim Chỉ May Mini',1,20000.00,20000.00),
(18,9,3,'Thước Đo Len Nhựa',1,18000.00,18000.00),
(24,14,1,'Bộ Kim Móc Len Kim Loại',7,25000.00,175000.00),
(25,15,18,'Bộ Kim Chỉ May Mini',1,20000.00,20000.00),
(26,16,18,'Bộ Kim Chỉ May Mini',2,20000.00,40000.00),
(27,16,3,'Thước Đo Len Nhựa',3,18000.00,54000.00),
(63,50,1,'Bộ Kim Móc Len Kim Loại',1,25000.00,25000.00),
(66,53,18,'Bộ Kim Chỉ May Mini',1,2000000.00,2000000.00),
(68,55,20,'Kéo Cắt Giấy Mini',1,12000.00,12000.00),
(70,57,21,'Kéo Cắt Giấy Mini',2,13000.00,26000.00),
(71,58,20,'Kéo Cắt Giấy Mini',2,12000.00,24000.00),
(76,63,12,'Ruy Băng Trang Trí',1,15000.00,15000.00),
(77,64,1,'Bộ Kim Móc Len Kim Loại',1,25000.00,25000.00),
(78,65,18,'Bộ Kim Chỉ May Mini',1,2000000.00,2000000.00),
(79,66,1,'Bộ Kim Móc Len Kim Loại',2,25000.00,50000.00),
(80,67,3,'Thước Đo Len Nhựa',1,18000.00,18000.00),
(81,68,18,'Bộ Kim Chỉ May Mini',1,2000000.00,2000000.00),
(82,69,20,'Kéo Cắt Giấy Mini',1,12000.00,12000.00),
(83,70,18,'Bộ Kim Chỉ May Mini',1,2000000.00,2000000.00),
(84,71,20,'Kéo Cắt Giấy Mini',1,12000.00,12000.00),
(86,73,14,'Khóa Cài Túi Xách Tròn',1,20000.00,20000.00),
(88,75,14,'Khóa Cài Túi Xách Tròn',1,20000.00,20000.00),
(89,76,20,'Kéo Cắt Giấy Mini',1,12000.00,12000.00),
(90,77,18,'Bộ Kim Chỉ May Mini',1,2000000.00,2000000.00),
(91,78,12,'Ruy Băng Trang Trí',1,15000.00,15000.00),
(92,79,18,'Bộ Kim Chỉ May Mini',1,2000000.00,2000000.00),
(93,80,18,'Bộ Kim Chỉ May Mini',1,2000000.00,2000000.00),
(95,82,14,'Khóa Cài Túi Xách Tròn',1,20000.00,20000.00),
(96,82,1,'Bộ Kim Móc Len Kim Loại',1,25000.00,25000.00),
(118,104,20,'Kéo Cắt Giấy Mini',1,12000.00,12000.00),
(123,108,2,'Bộ Kim Móc Len Kim Loại',2,27000.00,54000.00),
(124,109,21,'Kéo Cắt Giấy Mini',2,13000.00,26000.00),
(125,110,3,'Thước Đo Len Nhựa',1,18000.00,18000.00),
(126,111,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(127,112,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(128,113,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(129,114,35,'Móc Treo Túi Xách Gấp Gọn',1,50000.00,50000.00),
(130,115,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(131,116,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(132,117,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(133,118,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(134,119,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(135,120,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(136,121,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(137,122,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(138,123,35,'Móc Treo Túi Xách Gấp Gọn',1,50000.00,50000.00),
(139,124,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(140,125,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(141,126,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(142,127,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(143,128,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(144,129,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(145,130,3,'Thước Đo Len Nhựa',1,18000.00,18000.00),
(146,131,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(147,132,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(148,133,32,'Combo Quà Tặng Handmade',1,70000.00,70000.00),
(149,134,35,'Móc Treo Túi Xách Gấp Gọn',1,50000.00,50000.00),
(150,135,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(151,136,33,'Combo Quà Tặng Cao Cấp',2,240000.00,480000.00),
(152,137,34,'Dây Đeo Túi Xách Thay Thế',1,100000.00,100000.00),
(153,138,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(154,139,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(155,140,3,'Thước Đo Len Nhựa',1,18000.00,18000.00),
(156,141,35,'Móc Treo Túi Xách Gấp Gọn',1,50000.00,50000.00),
(157,142,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(158,143,33,'Combo Quà Tặng Cao Cấp',1,240000.00,240000.00),
(159,144,35,'Móc Treo Túi Xách Gấp Gọn',1,50000.00,50000.00),
(160,145,35,'Móc Treo Túi Xách Gấp Gọn',1,50000.00,50000.00);

-- attribute_values
INSERT INTO `attribute_values` VALUES
(1,1,'Đỏ'),
(2,1,'Xanh'),
(3,1,'Vàng'),
(4,2,'Nhỏ'),
(5,2,'Vừa'),
(6,2,'Lớn'),
(7,1,'Đen'),
(8,1,'Xanh Lá'),
(12,2,'Nhỏ Vừa'),
(17,1,'Trắng');

-- variant_attribute_values
INSERT INTO `variant_attribute_values` VALUES
(1,1),(14,1),(21,1),(36,1),
(2,2),(3,3),(20,3),
(1,4),(3,4),(5,4),(6,4),(9,4),(14,4),(20,4),(32,4),(35,4),
(2,5),(8,5),(10,5),(12,5),(21,5),(22,5),(31,5),(33,5),(34,5),(36,5),
(18,6),(23,6),
(6,7),(8,7),(9,7),(22,7),(23,7),(33,7),(34,7),(35,7),
(10,8);

-- vouchers
INSERT INTO `vouchers` VALUES
(6,'GIAM20K','fixed',20000.00,10000.00,0.00,91,'2026-01-07','2026-01-31',1),
(7,'GIAM10K','fixed',10000.00,15000.00,0.00,78,'2026-01-07','2026-12-22',1),
(9,'GIAM30k','fixed',30000.00,10000.00,0.00,100,'2026-01-09','2026-01-30',1),
(10,'GIAM20%','percent',20.00,10000.00,30000.00,89,'2026-01-06','2026-02-08',1);

-- =====================================================
-- Finish
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;
