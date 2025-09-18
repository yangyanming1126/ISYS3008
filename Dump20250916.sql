-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 192.168.0.237    Database: sleepytiger
-- ------------------------------------------------------
-- Server version	8.0.32

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

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `service_id` int NOT NULL,
  `payment_id` int DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payment_id` (`payment_id`),
  KEY `idx_bookings_date` (`date`),
  KEY `idx_bookings_service_id` (`service_id`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_user_date` (`user_id`,`date`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,'Admin Test Booking','+61 400 000 000','2025-01-15',1,6,'refunded','Test booking by admin','2025-09-04 09:48:49','2025-09-10 04:56:26'),(2,NULL,'John Smith','+61 400 123 456','2025-01-20',5,NULL,'pending','First time fishing','2025-09-04 09:48:49','2025-09-04 09:48:49'),(3,NULL,'The Williams Family','+61 400 345 678','2025-01-25',3,NULL,'confirmed','Family vacation with 2 children','2025-09-04 09:48:49','2025-09-04 09:48:49'),(4,2,'sdfs','1233323123','2025-09-27',1,2,'confirmed','Additional Notes (Optional)','2025-09-06 00:04:20','2025-09-06 00:06:34'),(5,2,'sdfs','1233323123','2025-09-19',3,1,'completed','Additional Notes (Optional)','2025-09-06 00:05:53','2025-09-10 07:27:09'),(6,2,'sdfs','1233323123','2025-09-14',8,3,'completed','Additional Notes (Optional)','2025-09-06 00:06:50','2025-09-10 04:19:48'),(7,2,'liuzg50505','123123123','2025-09-27',2,4,'completed','附加说明（可选）','2025-09-10 03:32:49','2025-09-10 04:19:45'),(8,2,'111','222','2025-09-20',2,5,'completed','附加说明（可选）','2025-09-10 03:47:37','2025-09-10 04:14:50'),(9,1,'111','222','2025-09-20',2,7,'refunded','附加说明（可选）','2025-09-10 04:54:00','2025-09-10 04:56:14');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'AUD',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'virtual',
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_transaction_id` (`transaction_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,5,200.00,'AUD','virtual','ST-1757117141895-axvangp9x','completed','2025-09-06 00:05:59','2025-09-06 00:05:59'),(2,4,150.00,'AUD','virtual','ST-1757117176314-cj7x623w3','completed','2025-09-06 00:06:34','2025-09-06 00:06:34'),(3,6,35.00,'AUD','virtual','ST-1757117193602-ztqef7z0m','completed','2025-09-06 00:06:51','2025-09-06 00:06:51'),(4,7,120.00,'AUD','virtual','ST-1757475157702-mb7ebgmh4','completed','2025-09-10 03:32:53','2025-09-10 03:32:53'),(5,8,120.00,'AUD','virtual','ST-1757476043324-rtpdbxsva','completed','2025-09-10 03:47:38','2025-09-10 03:47:38'),(6,1,150.00,'AUD','virtual','ST-1757479945652-dv2cnchmg','completed','2025-09-10 04:52:41','2025-09-10 04:52:41'),(7,9,120.00,'AUD','virtual','ST-1757480026006-mqqhpcy5n','completed','2025-09-10 04:54:01','2025-09-10 04:54:01');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_cn` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name_ru` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_cn` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `description_ru` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `category_cn` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_en` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_ru` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_services_active` (`is_active`),
  KEY `idx_services_multilang` (`name_cn`,`name_en`,`name_ru`),
  KEY `idx_services_category_multilang` (`category_cn`,`category_en`,`category_ru`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'豪华农庄住宿','Luxury Farmhouse Stay11','Роскошное проживание на ферме','宽敞的农庄住宿，享有乡村美景和现代化设施','Spacious farmhouse accommodation with countryside views and modern amenities','Просторное размещение на ферме с видом на сельскую местность и современными удобствами',150.00,'住宿服务','Accommodation','Размещение','images/stay.png',1,'2025-09-04 09:48:49','2025-09-10 07:55:24'),(2,'舒适农庄度假','Cozy Farm Retreat','Уютный фермерский отдых','迷人的度假村，非常适合寻求宁静乡村体验的夫妇','Charming retreat perfect for couples seeking peaceful countryside experience','Очаровательный отдых, идеальный для пар, ищущих спокойный сельский опыт',120.00,'住宿服务','Accommodation','Размещение','images/banner1.png',1,'2025-09-04 09:48:49','2025-09-10 08:02:58'),(3,'家庭农庄体验','Family Farm Experience','Семейный фермерский опыт','适合家庭的大型住宿，可完全体验农庄生活','Large accommodation suitable for families with full farm access','Большое размещение, подходящее для семей с полным доступом к ферме',200.00,'住宿服务','Accommodation','Размещение','images/banner2.png',0,'2025-09-04 09:48:49','2025-09-10 07:27:15'),(4,'儿童农庄乐园','Kids Farm Fun','Детские фермерские развлечения','专为儿童和家庭设计的互动农庄体验','Interactive farm experience designed especially for children and families','Интерактивный фермерский опыт, специально разработанный для детей и семей',25.00,'农庄活动','Farm Activities','Фермерские Занятия','images/fish_kids.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(5,'成人垂钓体验','Adult Fishing Experience','Рыбалка для взрослых','在我们的农庄池塘中享受宁静的垂钓体验','Peaceful fishing experience in our farm ponds','Спокойная рыбалка в наших фермерских прудах',40.00,'农庄活动','Farm Activities','Фермерские Занятия','images/fishing_adult.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(6,'家庭游乐场','Family Playground','Семейная игровая площадка','适合各年龄段儿童的安全有趣游乐场','Safe and fun playground area for children of all ages','Безопасная и веселая игровая площадка для детей всех возрастов',15.00,'农庄活动','Farm Activities','Фермерские Занятия','images/playground.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(7,'农庄探索之旅','Farm Tour Adventure','Приключенческий тур по ферме','导游带领参观我们的工作农庄和农业区域','Guided tour of our working farm and agricultural areas','Экскурсия по нашей действующей ферме и сельскохозяйственным зонам',30.00,'农庄活动','Farm Activities','Фермерские Занятия','images/banner3.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(8,'农庄新鲜餐食','Farm Fresh Meals','Свежие фермерские блюда','采用农庄新鲜食材制作的美味餐点','Delicious meals prepared with fresh ingredients from our farm','Вкусные блюда, приготовленные из свежих ингредиентов с нашей фермы',35.00,'餐饮服务','Dining','Питание','images/meal.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(9,'传统农庄早餐','Traditional Farm Breakfast','Традиционный фермерский завтрак','丰盛早餐，包含新鲜农场鸡蛋和当地农产品','Hearty breakfast featuring farm-fresh eggs and local produce','Сытный завтрак со свежими фермерскими яйцами и местными продуктами',25.00,'餐饮服务','Dining','Питание','images/corn.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(10,'新鲜水果体验','Fresh Fruit Experience','Опыт свежих фруктов','直接从我们的果园享受新鲜时令水果','Enjoy fresh seasonal fruits directly from our orchards','Наслаждайтесь свежими сезонными фруктами прямо из наших садов',28.00,'餐饮服务','Dining','Питание','images/apple.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(11,'苹果采摘季','Apple Picking Season','Сезон сбора яблок','收获季节采摘您自己的苹果','Pick your own apples during harvest season','Соберите свои собственные яблоки во время сезона сбора урожая',22.00,'季节性活动','Seasonal','Сезонные','images/apple.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(12,'草莓采摘','Strawberry Harvest','Сбор клубники','全家人的甜蜜草莓采摘体验','Sweet strawberry picking experience for the whole family','Сладкий опыт сбора клубники для всей семьи',20.00,'季节性活动','Seasonal','Сезонные','images/strawberry.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(13,'玉米迷宫冒险','Corn Maze Adventure','Приключение в кукурузном лабиринте','秋季穿越我们令人兴奋的玉米迷宫','Navigate through our exciting corn maze during autumn','Пройдите через наш захватывающий кукурузный лабиринт осенью',18.00,'季节性活动','Seasonal','Сезонные','images/corn.png',1,'2025-09-04 09:48:49','2025-09-04 09:48:49'),(14,'222','111','33','222','1111','333',2222.00,'22','1111','33','images/stay.png',1,'2025-09-10 07:55:45','2025-09-16 02:58:22');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `created_by` (`created_by`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@sleepytiger.com','admin123','admin','System','Administrator',NULL,1,'2025-09-04 09:48:49','2025-09-04 09:48:49',NULL),(2,'alice123','alice123@gmail.com','123456','user','zg12','liu12322','12312312322',1,'2025-09-06 00:03:52','2025-09-16 02:58:37',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-16 11:01:15
