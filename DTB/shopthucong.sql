-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: mysql-363d3467-toyotran0-dd22.d.aivencloud.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '1fb1da04-a901-11f0-88ce-0e71e1fb92e4:1-826';

--
-- Table structure for table `attribute_values`
--

DROP TABLE IF EXISTS `attribute_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attribute_values` (
  `AttributeValueID` int NOT NULL AUTO_INCREMENT,
  `AttributeID` int NOT NULL,
  `Value` varchar(100) NOT NULL,
  PRIMARY KEY (`AttributeValueID`),
  KEY `fk_attr_values_attributes` (`AttributeID`),
  CONSTRAINT `fk_attr_values_attributes` FOREIGN KEY (`AttributeID`) REFERENCES `attributes` (`AttributeID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attribute_values`
--

LOCK TABLES `attribute_values` WRITE;
/*!40000 ALTER TABLE `attribute_values` DISABLE KEYS */;
INSERT INTO `attribute_values` VALUES (1,1,'Đỏ'),(2,1,'Xanh'),(3,1,'Vàng'),(4,2,'Nhỏ'),(5,2,'Vừa'),(6,2,'Lớn'),(7,1,'Đen'),(8,1,'Xanh Lá'),(9,1,'Trắng');
/*!40000 ALTER TABLE `attribute_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attributes`
--

DROP TABLE IF EXISTS `attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attributes` (
  `AttributeID` int NOT NULL AUTO_INCREMENT,
  `AttributeName` varchar(100) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`AttributeID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attributes`
--

LOCK TABLES `attributes` WRITE;
/*!40000 ALTER TABLE `attributes` DISABLE KEYS */;
INSERT INTO `attributes` VALUES (1,'Màu sắc',NULL),(2,'Kích thước',NULL);
/*!40000 ALTER TABLE `attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `CartItemID` int NOT NULL AUTO_INCREMENT,
  `CartID` int DEFAULT NULL,
  `VariantID` int DEFAULT NULL,
  `Quantity` int DEFAULT '1',
  `UnitPrice` decimal(18,2) DEFAULT NULL,
  PRIMARY KEY (`CartItemID`),
  KEY `fk_cart_items_cart` (`CartID`),
  KEY `fk_cart_items_variant` (`VariantID`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`CartID`) REFERENCES `carts` (`CartID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`VariantID`) REFERENCES `product_variants` (`VariantID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `CartID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CartID`),
  UNIQUE KEY `unique_user_cart` (`UserID`),
  CONSTRAINT `fk_carts_users` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `CategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(255) NOT NULL,
  `Description` text,
  `Slug` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Dụng Cụ Đan Móc','Các loại dụng cụ phục vụ đan móc len sợi.','/san-pham/dung-cu-dan-moc','2025-10-30 07:27:28'),(2,'Phụ Kiện Túi Xách','Phụ kiện trang trí và linh kiện túi xách.','/san-pham/phu-kien-tui-xach','2025-10-30 07:27:28'),(3,'Phụ Kiện Trang Trí','Phụ Kiện trang trí cho sản phẩm handmade.','/san-pham/phu-kien-trang-tri','2025-10-30 07:27:28'),(4,'Phụ Kiện Thú Bông','Nguyên liệu cho thú bông, móc khóa.','/san-pham/phu-kien-thu-bong','2025-10-30 07:27:28'),(5,'Combo Quà Tặng','Các combo dụng cụ, phụ kiện làm quà tặng.','/san-pham/combo','2025-10-30 07:27:28'),(6,'Sản Phẩm Tiết Kiệm','Các sản phẩm có giá ưu đãi, tiết kiệm chi phí.','/san-pham/tiet-kiem','2025-10-30 07:27:28');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `combo_items`
--

DROP TABLE IF EXISTS `combo_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `combo_items` (
  `ComboItemID` int NOT NULL AUTO_INCREMENT,
  `ComboID` int DEFAULT NULL,
  `VariantID` int DEFAULT NULL,
  `Quantity` int DEFAULT '1',
  PRIMARY KEY (`ComboItemID`),
  KEY `fk_combo_items_combos` (`ComboID`),
  KEY `fk_combo_items_variants` (`VariantID`),
  CONSTRAINT `fk_combo_items_combos` FOREIGN KEY (`ComboID`) REFERENCES `combos` (`ComboID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_combo_items_variants` FOREIGN KEY (`VariantID`) REFERENCES `product_variants` (`VariantID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `combo_items`
--

LOCK TABLES `combo_items` WRITE;
/*!40000 ALTER TABLE `combo_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `combo_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `combos`
--

DROP TABLE IF EXISTS `combos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `combos` (
  `ComboID` int NOT NULL AUTO_INCREMENT,
  `ComboName` varchar(255) DEFAULT NULL,
  `Description` text,
  `ComboPrice` decimal(18,2) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ComboID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `combos`
--

LOCK TABLES `combos` WRITE;
/*!40000 ALTER TABLE `combos` DISABLE KEYS */;
/*!40000 ALTER TABLE `combos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `ImageID` int NOT NULL AUTO_INCREMENT,
  `VariantID` int DEFAULT NULL,
  `ImageUrl` varchar(255) DEFAULT NULL,
  `PublicID` varchar(255) DEFAULT NULL,
  `DisplayOrder` int DEFAULT NULL,
  PRIMARY KEY (`ImageID`),
  KEY `fk_images_variants` (`VariantID`),
  CONSTRAINT `fk_images_variants` FOREIGN KEY (`VariantID`) REFERENCES `product_variants` (`VariantID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `images`
--

LOCK TABLES `images` WRITE;
/*!40000 ALTER TABLE `images` DISABLE KEYS */;
INSERT INTO `images` VALUES (1,18,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810355/shopthucong/public/tzahhmkutycgwojvyphv.jpg','shopthucong/public/tzahhmkutycgwojvyphv',1),(2,20,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810420/shopthucong/public/osvl43eajd6lu8zqv9y2.jpg','shopthucong/public/osvl43eajd6lu8zqv9y2',1),(3,21,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810421/shopthucong/public/j9cmapgf8qirppbql9dc.jpg','shopthucong/public/j9cmapgf8qirppbql9dc',1),(4,1,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810521/shopthucong/public/gk7ss3qkcbrs7nsn1wfw.jpg','shopthucong/public/gk7ss3qkcbrs7nsn1wfw',1),(5,2,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810522/shopthucong/public/nytayp9aymifepxnkm8s.jpg','shopthucong/public/nytayp9aymifepxnkm8s',1),(6,3,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761810978/shopthucong/public/etz9yxtiohoh6qivph0g.jpg','shopthucong/public/etz9yxtiohoh6qivph0g',1),(7,5,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811032/shopthucong/public/uayyr9fzcwx4dew6sis4.png','shopthucong/public/uayyr9fzcwx4dew6sis4',1),(8,6,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811128/shopthucong/public/berrlasyrouotodepktl.jpg','shopthucong/public/berrlasyrouotodepktl',1),(9,22,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811131/shopthucong/public/gyiyfybtboxllybnhlow.jpg','shopthucong/public/gyiyfybtboxllybnhlow',1),(10,23,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811133/shopthucong/public/yl3yv1nftenrxgvhfs7v.jpg','shopthucong/public/yl3yv1nftenrxgvhfs7v',1),(11,8,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811609/shopthucong/public/rw0iavtyai0xnht0lhlv.jpg','shopthucong/public/rw0iavtyai0xnht0lhlv',1),(12,9,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811611/shopthucong/public/xqhzdrvgr7w6yostbnn9.jpg','shopthucong/public/xqhzdrvgr7w6yostbnn9',1),(13,10,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811711/shopthucong/public/lh7easxeo5xy5tt3agcl.png','shopthucong/public/lh7easxeo5xy5tt3agcl',1),(14,12,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811744/shopthucong/public/ovgg5m0bzzw6o04dwtjk.jpg','shopthucong/public/ovgg5m0bzzw6o04dwtjk',1),(15,14,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811792/shopthucong/public/pssmohvkbaxho51nc8nv.jpg','shopthucong/public/pssmohvkbaxho51nc8nv',1),(16,16,'https://res.cloudinary.com/dwijpevo4/image/upload/v1761811860/shopthucong/public/faj2rtpufbwk4btw95aq.jpg','shopthucong/public/faj2rtpufbwk4btw95aq',1);
/*!40000 ALTER TABLE `images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `OrderItemID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int DEFAULT NULL,
  `VariantID` int DEFAULT NULL,
  `ProductName` varchar(255) DEFAULT NULL,
  `Quantity` int DEFAULT NULL,
  `UnitPrice` decimal(18,2) DEFAULT NULL,
  `TotalPrice` decimal(18,2) DEFAULT NULL,
  PRIMARY KEY (`OrderItemID`),
  KEY `fk_order_items_orders` (`OrderID`),
  KEY `fk_order_items_variants` (`VariantID`),
  CONSTRAINT `fk_order_items_orders` FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_variants` FOREIGN KEY (`VariantID`) REFERENCES `product_variants` (`VariantID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `ReceiverName` varchar(255) DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `ShippingAddress` varchar(255) DEFAULT NULL,
  `PaymentMethod` varchar(100) DEFAULT NULL,
  `IsPaid` tinyint(1) DEFAULT '0',
  `Total` decimal(18,2) DEFAULT NULL,
  `Status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
  `Note` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`OrderID`),
  KEY `fk_orders_users` (`UserID`),
  CONSTRAINT `fk_orders_users` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `VariantID` int NOT NULL AUTO_INCREMENT,
  `ProductID` int NOT NULL,
  `SKU` varchar(100) NOT NULL,
  `VariantName` varchar(255) DEFAULT NULL,
  `Price` decimal(18,2) NOT NULL,
  `StockQuantity` int DEFAULT '0',
  `Weight` decimal(10,2) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`VariantID`),
  UNIQUE KEY `SKU` (`SKU`),
  KEY `fk_variants_products` (`ProductID`),
  CONSTRAINT `fk_variants_products` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_price_positive` CHECK ((`Price` >= 0)),
  CONSTRAINT `chk_stock_positive` CHECK ((`StockQuantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'DCM-001-1',NULL,25000.00,20,NULL,1,'2025-10-30 07:32:27','2025-10-30 07:48:38'),(2,1,'DCM-001-2',NULL,27000.00,15,NULL,1,'2025-10-30 07:32:27','2025-10-30 07:48:42'),(3,2,'DCM-002-1',NULL,18000.00,25,NULL,1,'2025-10-30 07:32:27','2025-10-30 07:56:16'),(4,2,'DCM-002-2',NULL,19000.00,10,NULL,1,'2025-10-30 07:32:27','2025-10-30 07:32:27'),(5,3,'DCM-003-1',NULL,30000.00,30,NULL,1,'2025-10-30 07:32:27','2025-10-30 07:57:11'),(6,4,'PKTB-001-1',NULL,5000.00,100,NULL,1,'2025-10-30 07:32:27','2025-10-30 08:06:05'),(8,5,'PKTB-002-1',NULL,6000.00,70,NULL,1,'2025-10-30 07:32:27','2025-10-30 08:06:47'),(9,5,'PKTB-002-2',NULL,6500.00,50,NULL,1,'2025-10-30 07:32:27','2025-10-30 08:06:50'),(10,6,'PKTT-001-1',NULL,10000.00,30,NULL,1,'2025-10-30 07:32:27','2025-10-30 08:08:26'),(12,7,'PKTT-002-1',NULL,15000.00,40,NULL,1,'2025-10-30 07:32:27','2025-10-30 08:09:11'),(14,8,'PKTX-001-1',NULL,20000.00,50,NULL,1,'2025-10-30 07:32:28','2025-10-30 08:09:50'),(16,9,'PKTX-002-1',NULL,35000.00,30,NULL,1,'2025-10-30 07:32:28','2025-10-30 08:10:55'),(18,10,'SPTK-001-1',NULL,15000.00,60,NULL,1,'2025-10-30 07:32:28','2025-10-30 07:45:52'),(19,10,'SPTK-001-2',NULL,17000.00,45,NULL,1,'2025-10-30 07:32:28','2025-10-30 07:32:28'),(20,11,'SPTK-002-1',NULL,12000.00,80,NULL,1,'2025-10-30 07:32:28','2025-10-30 07:46:59'),(21,11,'SPTK-002-2',NULL,13000.00,70,NULL,1,'2025-10-30 07:32:28','2025-10-30 07:47:01'),(22,4,'PKTB-001-3',NULL,7000.00,100,0.00,1,'2025-10-30 07:58:49','2025-10-30 08:06:05'),(23,4,'PKTB-001-4',NULL,8000.00,100,0.00,1,'2025-10-30 07:58:51','2025-10-30 08:06:05');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `ProductID` int NOT NULL AUTO_INCREMENT,
  `CategoryID` int DEFAULT NULL,
  `SKU` varchar(100) DEFAULT NULL,
  `ProductName` varchar(255) NOT NULL,
  `ShortDescription` text,
  `Material` varchar(255) DEFAULT NULL,
  `Description` text,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `IsActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`ProductID`),
  UNIQUE KEY `SKU` (`SKU`),
  KEY `fk_products_categories` (`CategoryID`),
  CONSTRAINT `fk_products_categories` FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'DCM-001','Bộ Kim Móc Len Kim Loại','Bộ kim móc 10 cây, nhiều kích cỡ','Kim loại','Phù hợp cho người mới học đan len.','2025-10-30 07:32:27','2025-10-30 07:48:38',1),(2,1,'DCM-002','Thước Đo Len Nhựa','Thước đo kích thước len tiện dụng','Nhựa','Dùng để đo đường kính kim hoặc len','2025-10-30 07:32:27','2025-10-30 07:56:16',1),(3,1,'DCM-003','Kéo Mini Cắt Len','Kéo nhỏ sắc bén, cắt len dễ dàng','Thép','Phù hợp cho mọi loại len.','2025-10-30 07:32:27','2025-10-30 07:57:11',1),(4,2,'PKTB-001','Mắt Thú Bông Nhựa Đen','Mắt nhựa đen an toàn cho thú bông','Nhựa','Dành cho thú bông handmade, nhiều kích cỡ','2025-10-30 07:32:27','2025-10-30 08:06:05',1),(5,2,'PKTB-002','Mũi Thú Bông Hình Tam Giác','Mũi nhựa màu đen, tam giác','Nhựa','Dễ gắn vào sản phẩm, an toàn','2025-10-30 07:32:27','2025-10-30 08:06:47',1),(6,3,'PKTT-001','Nút Hoa Trang Trí','Nút gỗ hoa nhỏ xinh','Gỗ','Dùng để may áo, túi, hoặc làm thiệp handmade','2025-10-30 07:32:27','2025-10-30 08:08:26',1),(7,3,'PKTT-002','Ruy Băng Trang Trí','Ruy băng lụa mềm, nhiều màu','Vải','Trang trí hộp quà, scrapbook, sổ tay','2025-10-30 07:32:27','2025-10-30 08:09:11',1),(8,4,'PKTX-001','Khóa Cài Túi Xách Tròn','Khóa tròn nhỏ màu bạc','Kim loại','Phù hợp với túi handmade.','2025-10-30 07:32:27','2025-10-30 08:09:50',1),(9,4,'PKTX-002','Dây Xích Túi Xách Vàng','Dây xích màu vàng sáng bóng','Kim loại','Trang trí và đeo túi thời trang','2025-10-30 07:32:27','2025-10-30 08:10:54',1),(10,5,'SPTK-001','Bộ Kim Chỉ May Mini','Bộ may vá mini tiện lợi','Thép','Bao gồm kim, chỉ, kéo, thước.','2025-10-30 07:32:28','2025-10-30 07:45:52',1),(11,6,'SPTK-002','Kéo Cắt Giấy Mini','Kéo nhỏ sắc bén','Thép','Dành cho học sinh, sinh viên.','2025-10-30 07:32:28','2025-10-30 07:46:59',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `FullName` varchar(255) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Role` enum('customer','admin') DEFAULT 'customer',
  `Status` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'b@gmail.com','$2b$10$M5tPA5QS.5l32bL5GRbyVuFAN/agzNetHPJdEXXfLaI00qDuaqEXy','Nguyễn Văn B','0901234567','TP.HCM','admin',1,'2025-10-27 16:04:51','2025-10-27 16:19:23'),(2,'b1@gmail.com','$2b$10$Hz/opFOlEKwmWAkgkUjSpObglpOeWQFgc8RAsiFVW4rGFc0neF7RO','Nguyễn Văn C','0901234567','TP.HCM','customer',1,'2025-10-27 16:24:34','2025-10-27 16:24:34'),(3,'6@gmail.com','$2b$10$nelamqg7NCYlvBVbl2UpGOF9T55EhVuHkv2K16rottSdQnd3lWIsu','Trần  Phong','0938217781','TPHCM','customer',1,'2025-10-27 16:24:40','2025-10-27 16:24:40');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variant_attribute_values`
--

DROP TABLE IF EXISTS `variant_attribute_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant_attribute_values` (
  `VariantID` int NOT NULL,
  `AttributeValueID` int NOT NULL,
  PRIMARY KEY (`VariantID`,`AttributeValueID`),
  KEY `fk_variant_attr_value` (`AttributeValueID`),
  CONSTRAINT `fk_variant_attr_value` FOREIGN KEY (`AttributeValueID`) REFERENCES `attribute_values` (`AttributeValueID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_variant_attr_variant` FOREIGN KEY (`VariantID`) REFERENCES `product_variants` (`VariantID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant_attribute_values`
--

LOCK TABLES `variant_attribute_values` WRITE;
/*!40000 ALTER TABLE `variant_attribute_values` DISABLE KEYS */;
INSERT INTO `variant_attribute_values` VALUES (1,1),(4,1),(14,1),(21,1),(2,2),(19,2),(3,3),(16,3),(20,3),(1,4),(3,4),(5,4),(6,4),(9,4),(14,4),(18,4),(20,4),(2,5),(4,5),(8,5),(10,5),(12,5),(16,5),(19,5),(21,5),(22,5),(23,6),(6,7),(8,7),(9,7),(22,7),(23,7),(10,8);
/*!40000 ALTER TABLE `variant_attribute_values` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-30 15:19:49
