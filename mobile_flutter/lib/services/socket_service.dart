import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'api_service.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  String? _currentCustomerId;

  final _orderCreatedController = StreamController<Map<String, dynamic>>.broadcast();
  final _orderStatusChangedController = StreamController<Map<String, dynamic>>.broadcast();
  final _orderCancelledController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get onOrderCreated => _orderCreatedController.stream;
  Stream<Map<String, dynamic>> get onOrderStatusChanged => _orderStatusChangedController.stream;
  Stream<Map<String, dynamic>> get onOrderCancelled => _orderCancelledController.stream;

  bool get isConnected => _socket?.connected ?? false;

  void initSocket() {
    final serverUrl = ApiService().baseUrl;

    if (_socket != null) {
      if (_socket!.connected) return;
      _socket!.disconnect();
      _socket = null;
    }

    try {
      _socket = IO.io(
        serverUrl,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .disableAutoConnect()
            .setReconnectionAttempts(5)
            .setReconnectionDelay(2000)
            .build(),
      );

      _socket!.connect();

      _socket!.onConnect((_) {
        debugPrint('⚡ [Flutter Socket.IO] Đã kết nối tới: $serverUrl');
        if (_currentCustomerId != null) {
          subscribeToCustomer(_currentCustomerId!);
        }
      });

      _socket!.onDisconnect((_) {
        debugPrint('❌ [Flutter Socket.IO] Mất kết nối tới server');
      });

      _socket!.onConnectError((err) {
        debugPrint('⚠️ [Flutter Socket.IO] Lỗi kết nối: $err');
      });

      _socket!.on('ORDER_CREATED', (data) {
        debugPrint('🔔 [Flutter Socket.IO] ORDER_CREATED: $data');
        if (data is Map) {
          _orderCreatedController.add(Map<String, dynamic>.from(data));
        }
      });

      _socket!.on('ORDER_STATUS_CHANGED', (data) {
        debugPrint('🔔 [Flutter Socket.IO] ORDER_STATUS_CHANGED: $data');
        if (data is Map) {
          _orderStatusChangedController.add(Map<String, dynamic>.from(data));
        }
      });

      _socket!.on('ORDER_CANCELLED', (data) {
        debugPrint('🔔 [Flutter Socket.IO] ORDER_CANCELLED: $data');
        if (data is Map) {
          _orderCancelledController.add(Map<String, dynamic>.from(data));
        }
      });
    } catch (e) {
      debugPrint('⚠️ [Flutter Socket.IO] Không thể khởi tạo socket: $e');
    }
  }

  void subscribeToCustomer(String customerId) {
    _currentCustomerId = customerId;
    if (_socket != null && _socket!.connected) {
      debugPrint('📡 Subscribing to customer channel: $customerId');
      _socket!.emit('subscribe:customer', customerId);
    }
  }

  void disconnect() {
    _currentCustomerId = null;
    _socket?.disconnect();
    _socket = null;
  }

  void dispose() {
    disconnect();
    _orderCreatedController.close();
    _orderStatusChangedController.close();
    _orderCancelledController.close();
  }
}
