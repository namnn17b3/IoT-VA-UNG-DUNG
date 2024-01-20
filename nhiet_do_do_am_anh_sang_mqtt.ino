#include <Wire.h>
#include <DHT.h>
#include <BH1750.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>
#include <thread>
using namespace websockets;

const int DHTPIN = 5;       //Đọc dữ liệu từ DHT11 ở chân 2 trên mạch Arduino
const int DHTTYPE = DHT11;  //Khai báo loại cảm biến, có 2 loại là DHT11 và DHT22
const int ledPin = 2;  // Chân D2 của ESP32 kết nối với LED
const int earthSensorPin = 35; // Chân D35 của ESP32 nối với chân A0 của độ ẩm đất

const int relayPin = 23;

const char* ssid = "2K2 Never Die";
const char* password = "20022002";
// char* host = "ws://192.168.1.109:8000";
// char* path = "/esp32/websocket";
// static int i = 0;
const char* websockets_server_host = "192.168.1.109"; //Enter server adress
const uint16_t websockets_server_port = 8000; // Enter server port

int ledAutoMode = 0;
int pumpAutoMode = 0;

// WebSocketClient webSocketClient;
WebsocketsClient websocketsClient;
WiFiClient client;
StaticJsonDocument<200> jsonData;
StaticJsonDocument<200> jsonFrom;

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
BH1750 lightMeter(0x23);

void connectWebSocket() {
  /*// Connect to the websocket server
  if (client.connect("192.168.1.109", 8000)) {
    Serial.println("Connected");
  } else {
    Serial.println("Connection failed.");
    return;
  }

  // Handshake with the server
  webSocketClient.path = path;
  webSocketClient.host = host;
  if (webSocketClient.handshake(client)) {
    Serial.println("Handshake successful");
  } else {
    Serial.println("Handshake failed.");
    return;
  }*/

  // Kết nối đến máy chủ WebSocket
  // webSocketClient.begin(webSocketServer);
  websocketsClient.connect(websockets_server_host, websockets_server_port, "/esp32/websocket");
}

void connectWiFi() {
  // Kết nối vào mạng Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    // delay(200);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  connectWebSocket();
}

void controlAutoLedAndPump() {
  while (true) {
    // lcd.init();
    // lcd.backlight();
    // lcd.clear();

    // float humidity = dht.readHumidity();             // Đọc độ ẩm
    // float temperature = dht.readTemperature();       // Đọc nhiệt độ

    if (ledAutoMode == 1) {
      float lightValue = lightMeter.readLightLevel();  // Đọc cường độ sáng
      ledControl(lightValue);
    }
    
    if (pumpAutoMode == 1) {
      float earthMoisture = earthMoisturePercent(analogRead(earthSensorPin));  // Đọc số analog của độ ẩm đất
      pumpControl(earthMoisture);
    }
    
    // printSerial(temperature, humidity, lightValue, earthMoisture);
    // printLCD(temperature, humidity, lightValue, earthMoisture);

    // if (!client.connected()) {
    //   Serial.println("reconnect to websocket!");
    //   connectWebSocket();
    // }

    // Tạo JSON object để chứa dữ liệu
    // jsonData["authen"] = "from esp32 N17-IoT";
    // jsonData["temperature"] = temperature;
    // jsonData["humidity"] = humidity;
    // jsonData["lightValue"] = lightValue;
    // jsonData["earthMoisture"] = earthMoisture;

    // // Chuyển JSON thành một chuỗi
    // String jsonString;
    // serializeJson(jsonData, jsonString);

    // // Gửi chuỗi JSON đến server qua WebSocket
    // webSocketClient.sendData(jsonString);

    delay(2000);
  }
}

void setup() {
  // esp_restart();
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();

  dht.begin();                     // Khởi động cảm biến DHT11
  Wire.begin();
  lightMeter.begin();              // Khởi động cảm biến BH1750
  pinMode(ledPin, OUTPUT);         // Khởi động LED

  pinMode(earthSensorPin, INPUT);
  pinMode(relayPin, OUTPUT);

  digitalWrite(relayPin, HIGH); // Tắt

  connectWiFi();

  // std::thread sendJsonDataToServerThread(sendJsonDataToServer);
  // sendJsonDataToServerThread.detach();

  // // run callback when messages are received
  websocketsClient.onMessage([&](WebsocketsMessage message) {
    String jsonMessage = message.data();
    Serial.print("Got Message: ");
    Serial.println(jsonMessage);
    
    // Định nghĩa bộ đệm cho JSON để phân tích
    DynamicJsonDocument jsonDoc(200);

    // Phân tích chuỗi JSON
    DeserializationError error = deserializeJson(jsonDoc, jsonMessage.c_str());

    // Kiểm tra lỗi khi phân tích
    if (error) {
      Serial.print(F("Lỗi khi phân tích JSON: "));
      Serial.println(error.c_str());
      return;
    }

    // Trích xuất thông tin từ JSON
    const char* fromCStr = jsonDoc["from"];
    String from = String(fromCStr);
    if (from == "admin") {
      int maintenanceMode = jsonDoc["maintenanceMode"];
      if (maintenanceMode == 0) {
        ledAutoMode = jsonDoc["ledAutoMode"];
        pumpAutoMode = jsonDoc["pumpAutoMode"];
      }
      else if (maintenanceMode == 1) {
        ledAutoMode = 0;
        pumpAutoMode = 0;
      }
    }
    else if (from == "user") {
      int ledMode = jsonDoc["ledMode"];
      int pumpMode = jsonDoc["pumpMode"];
      
      if (ledAutoMode == 0) {
        if (ledMode == 0) {
          digitalWrite(ledPin, LOW);  // Tắt LED
        }
        else if (ledMode == 1) {
          digitalWrite(ledPin, HIGH); // Bật LED
        }
      }

      if (pumpAutoMode == 0) {
        if (pumpMode == 0) {
          digitalWrite(relayPin, HIGH); // Tắt
        }
        else if (pumpMode == 1) {
          digitalWrite(relayPin, LOW); // Bật
        }
      }
    }
  });

  jsonFrom["from"] = "esp32";
  jsonFrom["first"] = 1;
  String jsonString;
  serializeJson(jsonFrom, jsonString);

  websocketsClient.send(jsonString);

  std::thread controlAutoLedAndPumpThread(controlAutoLedAndPump);
  controlAutoLedAndPumpThread.detach();
}

void loop() {
  // float lightValue = lightMeter.readLightLevel();  // Đọc cường độ sáng
  // float earthMoisture = earthMoisturePercent(analogRead(earthSensorPin));  // Đọc số analog của độ ẩm đất
  // lcd.clear();

  // float humidity = dht.readHumidity();             // Đọc độ ẩm
  // float temperature = dht.readTemperature();       // Đọc nhiệt độ
  // float lightValue = lightMeter.readLightLevel();  // Đọc cường độ sáng
  // float earthMoisture = earthMoisturePercent(analogRead(earthSensorPin));  // Đọc số analog của độ ẩm đất
  
  // printSerial(temperature, humidity, lightValue, earthMoisture);
  // printLCD(temperature, humidity, lightValue, earthMoisture);

  // if (i == 0) {
  //   std::thread controlLedAndPumpThread(controlLedAndPump);
  //   controlLedAndPumpThread.detach();
  //   i = 1;
  // }

  // if (!client.connected()) {
  //   Serial.println("reconnect to websocket!");
  //   connectWebSocket();
  // }
  // Serial.println("ok");

  lcd.clear();

  float humidity = dht.readHumidity();             // Đọc độ ẩm
  float temperature = dht.readTemperature();       // Đọc nhiệt độ
  float lightValue = lightMeter.readLightLevel();  // Đọc cường độ sáng
  float earthMoisture = earthMoisturePercent(analogRead(earthSensorPin));  // Đọc số analog của độ ẩm đất
  
  printSerial(temperature, humidity, lightValue, earthMoisture);
  printLCD(temperature, humidity, lightValue, earthMoisture);

  // Kiểm tra kết nối đến WebSocket và xử lý sự kiện
  websocketsClient.poll();

  // Tạo JSON object để chứa dữ liệu
  jsonData["from"] = "esp32";
  jsonData["temperature"] = temperature;
  jsonData["humidity"] = humidity;
  jsonData["lightValue"] = lightValue;
  jsonData["earthMoisture"] = earthMoisture;
  
  // Chuyển JSON thành một chuỗi
  String jsonString;
  serializeJson(jsonData, jsonString);

  /*// Gửi chuỗi JSON đến server qua WebSocket
  webSocketClient.sendData(jsonString);*/

  // if (webSocketClient.availableForWrite()) {
  //   webSocketClient.sendData(jsonString);
  // }

  websocketsClient.send(jsonString);

  delay(5000);
}

// điều khiển máy bơm
void pumpControl(float earthMoisture) {
  if(earthMoisture <= 30) {
    // độ ẩm thấp thì bật mức thấp -> Khóa vào chân NO
    digitalWrite(relayPin, LOW);
  } else {
    // độ ẩm thấp thì bật mức cao -> Khóa vào chân NC
    digitalWrite(relayPin, HIGH);
  }
}

float earthMoisturePercent(int analog) {
  float virtualPercent = map(analog, 0, 4095, 0, 100);
  float result = 100 - virtualPercent;
  return result;
}

void ledControl(float lightValue) {
  if(lightValue < 30) {
    digitalWrite(ledPin, HIGH); // Bật LED
  }
  else {
    digitalWrite(ledPin, LOW);  // Tắt LED
  }
}

void printSerial(float temperature, float humidity, float lightValue, float earthMoisture) {
  Serial.print("Nhiet do: ");
  Serial.print(temperature);  //Xuất nhiệt độ
  Serial.println(" C");

  Serial.print("Do am: ");
  Serial.print(humidity);  //Xuất độ ẩm
  Serial.println("%");

  Serial.print("Anh sang: ");
  Serial.print(lightValue);
  Serial.println(" lx");

  Serial.print("Do am dat: ");
  Serial.print(earthMoisture);
  Serial.println("%");
}

void printLCD(float temperature, float humidity, float lightValue, float earthMoisture) {
  lcd.setCursor(0, 0);
  lcd.print(temperature);
  lcd.print("C");

  lcd.setCursor(8, 0);
  lcd.print(humidity);
  lcd.print("%");

  lcd.setCursor(0, 1);
  lcd.print(lightValue);
  lcd.print("lx");

  lcd.setCursor(10, 1);
  lcd.print(earthMoisture);
  lcd.print("%");
}