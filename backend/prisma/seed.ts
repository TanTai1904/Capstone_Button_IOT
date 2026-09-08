import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing existing database tables...');
  await prisma.auditLog.deleteMany();
  await prisma.idempotencyRecord.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.deviceTelemetry.deleteMany();
  await prisma.deviceEvent.deleteMany();
  await prisma.deviceConfiguration.deleteMany();
  await prisma.device.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  console.log('🏪 Creating Stores...');
  const store1 = await prisma.store.create({
    data: {
      name: 'Đại lý Nước & Gas Gia Định',
      code: 'STORE-GD01',
      ownerName: 'Nguyễn Văn Định',
      phone: '0908112233',
      email: 'store@smartorder.local',
      address: '142 Nguyễn Thị Minh Khai, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      status: 'ACTIVE',
      approvedAt: new Date(),
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Minh Khôi Mart Nhu Yếu Phẩm',
      code: 'STORE-MK02',
      ownerName: 'Lê Minh Khôi',
      phone: '0912445566',
      email: 'minhkhoi@smartorder.local',
      address: '88 Song Hành, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
      status: 'ACTIVE',
      approvedAt: new Date(),
    },
  });

  console.log('👤 Creating Users & Accounts...');
  // Super Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@smartorder.local',
      username: 'admin',
      passwordHash,
      fullName: 'Võ Minh Quân (Super Admin)',
      phone: '0901000999',
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });

  // Store 1 Owner
  const storeOwnerUser = await prisma.user.create({
    data: {
      email: 'store@smartorder.local',
      username: 'store_owner',
      passwordHash,
      fullName: 'Nguyễn Văn Định (Store Owner)',
      phone: '0908112233',
      role: 'STORE_OWNER',
      storeId: store1.id,
      emailVerified: true,
    },
  });

  // Store 1 Staff
  const storeStaffUser = await prisma.user.create({
    data: {
      email: 'staff@smartorder.local',
      username: 'store_staff',
      passwordHash,
      fullName: 'Trần Văn Tiến (Store Staff)',
      phone: '0908112244',
      role: 'STORE_STAFF',
      storeId: store1.id,
      emailVerified: true,
    },
  });

  // Technician
  const techUser = await prisma.user.create({
    data: {
      email: 'tech@smartorder.local',
      username: 'technician',
      passwordHash,
      fullName: 'Hoàng Long (IoT Systems Tech)',
      phone: '0909334455',
      role: 'TECHNICIAN',
      emailVerified: true,
    },
  });

  // Customers
  const customer1User = await prisma.user.create({
    data: {
      email: 'customer@smartorder.local',
      username: 'customer',
      passwordHash,
      fullName: 'Nguyễn Văn An',
      phone: '0988776655',
      role: 'CUSTOMER',
      storeId: store1.id,
      emailVerified: true,
    },
  });

  const customer1Profile = await prisma.customerProfile.create({
    data: {
      userId: customer1User.id,
      storeId: store1.id,
      apartment: 'Phòng 1204',
      building: 'Tháp Sapphire',
      floor: 'Tầng 12',
      room: '1204',
      deliveryAddress: 'Căn hộ 1204, Tháp Sapphire, Sunwah Pearl, 90 Nguyễn Hữu Cảnh, P. 22, Bình Thạnh',
      phone: '0988776655',
    },
  });

  const customer2User = await prisma.user.create({
    data: {
      email: 'customer2@smartorder.local',
      username: 'customer2',
      passwordHash,
      fullName: 'Trần Thị Mai',
      phone: '0977223344',
      role: 'CUSTOMER',
      storeId: store1.id,
      emailVerified: true,
    },
  });

  const customer2Profile = await prisma.customerProfile.create({
    data: {
      userId: customer2User.id,
      storeId: store1.id,
      apartment: 'Phòng 502',
      building: 'Block T2',
      floor: 'Tầng 5',
      room: '502',
      deliveryAddress: 'Phòng 502, Vista Verde, Đường Đồng Văn Cống, Phường Thạnh Mỹ Lợi, TP. Thủ Đức',
      phone: '0977223344',
    },
  });

  const customer3User = await prisma.user.create({
    data: {
      email: 'customer3@smartorder.local',
      username: 'customer3',
      passwordHash,
      fullName: 'Lê Hoàng Nam',
      phone: '0966332211',
      role: 'CUSTOMER',
      storeId: store1.id,
      emailVerified: true,
    },
  });

  const customer3Profile = await prisma.customerProfile.create({
    data: {
      userId: customer3User.id,
      storeId: store1.id,
      apartment: 'Shophouse SH-08',
      building: 'Masteri Thảo Điền',
      floor: 'Tầng Trệt',
      room: 'SH-08',
      deliveryAddress: 'Shophouse SH-08, Masteri Thảo Điền, 159 Xa Lộ Hà Nội, P. Thảo Điền, TP. Thủ Đức',
      phone: '0966332211',
    },
  });

  console.log('📦 Creating Products...');
  const prodLavie20L = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Nước khoáng thiên nhiên La Vie 20L',
      brand: 'La Vie (Nestlé Waters)',
      sku: 'WTR-LAV-20L',
      category: 'Nước uống',
      unit: 'Bình 20L',
      price: 68000,
      stock: 150,
      reservedStock: 2,
      minStockAlert: 20,
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    },
  });

  const prodVinhHao20L = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Nước khoáng Vĩnh Hảo 20L có vòi',
      brand: 'Vĩnh Hảo (Masan)',
      sku: 'WTR-VINH-20L',
      category: 'Nước uống',
      unit: 'Bình 20L',
      price: 72000,
      stock: 95,
      reservedStock: 0,
      minStockAlert: 15,
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    },
  });

  const prodPetrolimex12kg = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Bình gas Petrolimex 12kg Van Ngang',
      brand: 'Petrolimex',
      sku: 'GAS-PET-12KG',
      category: 'Gas',
      unit: 'Bình 12kg',
      price: 435000,
      stock: 45,
      reservedStock: 1,
      minStockAlert: 10,
      imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80',
    },
  });

  const prodGiaDinhGas12kg = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Bình gas Gia Đình 12kg Van Chụp',
      brand: 'Gia Đình Gas',
      sku: 'GAS-GD-12KG',
      category: 'Gas',
      unit: 'Bình 12kg',
      price: 420000,
      stock: 38,
      reservedStock: 0,
      minStockAlert: 8,
      imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80',
    },
  });

  const prodGaoST25 = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Gạo đặc sản ST25 Ông Cua Túi 5kg',
      brand: 'ST25 Ông Cua',
      sku: 'RIC-ST25-5KG',
      category: 'Gạo',
      unit: 'Túi 5kg',
      price: 195000,
      stock: 80,
      reservedStock: 1,
      minStockAlert: 15,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    },
  });

  const prodVinamilkMilk = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Thùng sữa tươi tiệt trùng Vinamilk ít đường 180ml (48 hộp)',
      brand: 'Vinamilk',
      sku: 'MLK-VNM-180ML',
      category: 'Sữa',
      unit: 'Thùng 48 hộp',
      price: 385000,
      stock: 50,
      reservedStock: 0,
      minStockAlert: 10,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    },
  });

  const prodSimplyOil5L = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Dầu đậu nành nguyên chất Simply Can 5L',
      brand: 'Simply',
      sku: 'OIL-SMP-5L',
      category: 'Nhu yếu phẩm',
      unit: 'Can 5L',
      price: 275000,
      stock: 40,
      reservedStock: 0,
      minStockAlert: 10,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    },
  });

  console.log('🔘 Creating Devices & Buttons...');
  // Device 1: Nút Nước Lavie Bếp
  const dev1 = await prisma.device.create({
    data: {
      deviceId: 'BTN-8829-WTR',
      serialNumber: 'SN-ESP32-882901',
      deviceSecret: 'sec_smart_button_8829_wtr_key_99',
      claimCode: 'CLAIM-749201',
      qrPayload: 'https://smartorder.local/claim?d=BTN-8829-WTR&c=CLAIM-749201',
      firmwareVersion: '1.2.0',
      hardwareModel: 'ESP32-WROOM-32E',
      status: 'ACTIVE',
      storeId: store1.id,
      customerId: customer1Profile.id,
      batteryLevel: 94,
      wifiRSSI: -56,
      lastSeenAt: new Date(),
    },
  });

  await prisma.deviceConfiguration.create({
    data: {
      deviceId: dev1.id,
      customName: 'Nút Nước Lavie Bếp',
      productId: prodLavie20L.id,
      defaultQuantity: 1,
      allowCustomerQuantity: true,
      allowCustomerProduct: false,
      quickOrderDirect: true,
      cancelWindowSeconds: 60,
      soundEnabled: true,
      ledEnabled: true,
      version: 1,
    },
  });

  // Device 2: Nút Gas Petrolimex
  const dev2 = await prisma.device.create({
    data: {
      deviceId: 'BTN-8830-GAS',
      serialNumber: 'SN-ESP32-883002',
      deviceSecret: 'sec_smart_button_8830_gas_key_88',
      claimCode: 'CLAIM-749202',
      qrPayload: 'https://smartorder.local/claim?d=BTN-8830-GAS&c=CLAIM-749202',
      firmwareVersion: '1.2.0',
      hardwareModel: 'ESP32-WROOM-32E',
      status: 'ACTIVE',
      storeId: store1.id,
      customerId: customer1Profile.id,
      batteryLevel: 88,
      wifiRSSI: -62,
      lastSeenAt: new Date(Date.now() - 3600 * 1000 * 4),
    },
  });

  await prisma.deviceConfiguration.create({
    data: {
      deviceId: dev2.id,
      customName: 'Nút Gas Petrolimex',
      productId: prodPetrolimex12kg.id,
      defaultQuantity: 1,
      allowCustomerQuantity: false,
      allowCustomerProduct: false,
      quickOrderDirect: true,
      cancelWindowSeconds: 120,
      soundEnabled: true,
      ledEnabled: true,
      version: 1,
    },
  });

  // Device 3: Nút Gạo ST25 (Customer 2)
  const dev3 = await prisma.device.create({
    data: {
      deviceId: 'BTN-8831-RIC',
      serialNumber: 'SN-ESP32-883103',
      deviceSecret: 'sec_smart_button_8831_ric_key_77',
      claimCode: 'CLAIM-749203',
      qrPayload: 'https://smartorder.local/claim?d=BTN-8831-RIC&c=CLAIM-749203',
      firmwareVersion: '1.2.0',
      hardwareModel: 'ESP32-C3-MINI',
      status: 'ACTIVE',
      storeId: store1.id,
      customerId: customer2Profile.id,
      batteryLevel: 91,
      wifiRSSI: -58,
      lastSeenAt: new Date(),
    },
  });

  await prisma.deviceConfiguration.create({
    data: {
      deviceId: dev3.id,
      customName: 'Nút Gạo ST25 Ông Cua',
      productId: prodGaoST25.id,
      defaultQuantity: 1,
      allowCustomerQuantity: true,
      allowCustomerProduct: true,
      quickOrderDirect: true,
      cancelWindowSeconds: 60,
      soundEnabled: true,
      ledEnabled: true,
      version: 1,
    },
  });

  // Device 4: Nút Sữa Vinamilk (Customer 2)
  const dev4 = await prisma.device.create({
    data: {
      deviceId: 'BTN-8832-MLK',
      serialNumber: 'SN-ESP32-883204',
      deviceSecret: 'sec_smart_button_8832_mlk_key_66',
      claimCode: 'CLAIM-749204',
      qrPayload: 'https://smartorder.local/claim?d=BTN-8832-MLK&c=CLAIM-749204',
      firmwareVersion: '1.2.0',
      hardwareModel: 'ESP32-C3-MINI',
      status: 'ACTIVE',
      storeId: store1.id,
      customerId: customer2Profile.id,
      batteryLevel: 79,
      wifiRSSI: -64,
      lastSeenAt: new Date(Date.now() - 3600 * 1000 * 8),
    },
  });

  await prisma.deviceConfiguration.create({
    data: {
      deviceId: dev4.id,
      customName: 'Nút Thùng Sữa Trẻ Em',
      productId: prodVinamilkMilk.id,
      defaultQuantity: 1,
      allowCustomerQuantity: true,
      allowCustomerProduct: false,
      quickOrderDirect: true,
      cancelWindowSeconds: 60,
      soundEnabled: true,
      ledEnabled: true,
      version: 1,
    },
  });

  // Device 5: Unassigned device ready to be claimed
  const dev5 = await prisma.device.create({
    data: {
      deviceId: 'BTN-8835-UNCLAIM',
      serialNumber: 'SN-ESP32-883505',
      deviceSecret: 'sec_smart_button_8835_raw_key_55',
      claimCode: 'CLAIM-112233',
      qrPayload: 'https://smartorder.local/claim?d=BTN-8835-UNCLAIM&c=CLAIM-112233',
      firmwareVersion: '1.2.0',
      hardwareModel: 'ESP32-WROOM-32E',
      status: 'UNCLAIMED',
      batteryLevel: 100,
      wifiRSSI: 0,
    },
  });

  console.log('🧾 Creating Seed Orders...');
  // Order 1: Delivered Order from Customer 1 (Button 1)
  const ord1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now().toString().slice(-6)}-01`,
      storeId: store1.id,
      customerId: customer1Profile.id,
      deviceId: dev1.id,
      status: 'DELIVERED',
      totalAmount: 68000,
      deliveryAddress: customer1Profile.deliveryAddress,
      customerPhone: customer1Profile.phone,
      customerName: customer1User.fullName,
      createdAt: new Date(Date.now() - 7200 * 1000),
      cancelExpiresAt: new Date(Date.now() - 7100 * 1000),
      items: {
        create: [
          {
            productId: prodLavie20L.id,
            productName: prodLavie20L.name,
            quantity: 1,
            unitPrice: 68000,
            totalPrice: 68000,
          },
        ],
      },
    },
  });

  // Order 2: Out for delivery
  const ord2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now().toString().slice(-6)}-02`,
      storeId: store1.id,
      customerId: customer1Profile.id,
      deviceId: dev2.id,
      status: 'OUT_FOR_DELIVERY',
      totalAmount: 435000,
      deliveryAddress: customer1Profile.deliveryAddress,
      customerPhone: customer1Profile.phone,
      customerName: customer1User.fullName,
      createdAt: new Date(Date.now() - 3600 * 1000 * 2),
      items: {
        create: [
          {
            productId: prodPetrolimex12kg.id,
            productName: prodPetrolimex12kg.name,
            quantity: 1,
            unitPrice: 435000,
            totalPrice: 435000,
          },
        ],
      },
    },
  });

  // Order 3: Completed yesterday
  const ord3 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now().toString().slice(-6)}-03`,
      storeId: store1.id,
      customerId: customer2Profile.id,
      deviceId: dev3.id,
      status: 'COMPLETED',
      totalAmount: 195000,
      deliveryAddress: customer2Profile.deliveryAddress,
      customerPhone: customer2Profile.phone,
      customerName: customer2User.fullName,
      createdAt: new Date(Date.now() - 3600 * 1000 * 26),
      items: {
        create: [
          {
            productId: prodGaoST25.id,
            productName: prodGaoST25.name,
            quantity: 1,
            unitPrice: 195000,
            totalPrice: 195000,
          },
        ],
      },
    },
  });

  console.log('📝 Creating Initial Audit Logs...');
  await prisma.auditLog.create({
    data: {
      userId: storeOwnerUser.id,
      action: 'DEVICE_CONFIGURED',
      entity: 'Device',
      entityId: dev1.id,
      newValues: JSON.stringify({ customName: 'Nút Nước Lavie Bếp', productId: prodLavie20L.id }),
    },
  });

  console.log('✅ Seed process successfully finished!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
