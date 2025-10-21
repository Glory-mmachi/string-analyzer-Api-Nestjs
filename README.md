# 🧠 String Analyzer API

## 🧾 Overview

The **String Analyzer API** is a simple yet powerful **NestJS-based** application for analyzing and managing string data.  
It performs text analysis, including **palindrome detection**, **character frequency mapping**, and **word count**, and provides flexible filtering — even via **natural language queries**.

> ⚙️ The project uses **in-memory storage** (no external database), making it lightweight and perfect for learning or demos.

---

## 🚀 Features

- 🔍 Analyze strings for:
  - Palindrome status  
  - Word count  
  - Character frequency  
  - Unique characters  
  - SHA-256 hash  
- 📂 Retrieve all analyzed strings  
- 🧠 Filter results by length, word count, or characters  
- 💬 Interpret natural language filters (e.g., “all single word palindromic strings”)  
- 🗑️ Delete analyzed strings  
- 🧾 Fully documented API via **Swagger**

---

## 🧩 Tech Stack

| Tool | Purpose |
|------|----------|
| **NestJS** | Backend framework |
| **TypeScript** | Strong typing and structure |
| **Swagger (OpenAPI)** | API documentation |
| **In-memory storage** | No external database |

---

## 🧱 Project Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Glory-mmachi/string-analyzer-Api-Nestjs.git
cd string-analyzer-Api-Nestjs
2️⃣ Install Dependencies
bash
Copy code
npm install
3️⃣ Run the Server (Development)
bash
Copy code
npm run start:dev
4️⃣ Open the API Documentation
Once the app starts, visit:
👉 http://localhost:3000/api/docs

📘 API Endpoints
1️⃣ Analyze a String
POST /analyzer/string
Analyzes a given string and returns its properties.

Request Body
json
Copy code
{
  "input": "madam"
}
Response
json
Copy code
{
  "id": "3e25960a79dbc69b674cd4ec67a72c62",
  "value": "madam",
  "properties": {
    "input": "madam",
    "length": 5,
    "is_palindrome": true,
    "unique_characters": 3,
    "word_count": 1,
    "sha256_hash": "3e25960a79dbc69b674cd4ec67a72c62d6f8b0a05d5c1eab8f9f6b3f1e2b1c8e2",
    "character_frequency_map": { "m": 2, "a": 2, "d": 1 }
  },
  "created_at": "2025-10-20T18:50:32.000Z"
}
2️⃣ Get All Strings (with Filters)
GET /analyzer/strings

Optional Query Parameters
Parameter	Type	Description
is_palindrome	boolean	Filter by palindrome status
min_length	number	Minimum string length
max_length	number	Maximum string length
word_count	number	Filter by word count
contains_character	string	Filter by character presence

Example
bash
Copy code
GET /analyzer/strings?is_palindrome=true&contains_character=a
3️⃣ Filter by Natural Language
GET /analyzer/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings

Response
json
Copy code
{
  "data": [
    {
      "id": "hash1",
      "value": "madam",
      "properties": { "is_palindrome": true, "word_count": 1 },
      "created_at": "2025-10-20T12:00:00Z"
    }
  ],
  "count": 1,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": { "is_palindrome": true, "word_count": 1 }
  }
}
4️⃣ Get a Specific String
GET /analyzer/:value

Example
bash
Copy code
GET /analyzer/racecar
5️⃣ Delete a String
DELETE /analyzer/:input

Example
bash
Copy code
DELETE /analyzer/madam
Response
json
Copy code
{
  "message": "Deleted successfully"
}
⚠️ Error Handling
Status	Description
400	Invalid input or query parameters
404	String not found
409	Duplicate string detected
500	Internal server error

🧪 Example Palindromes
Example	Palindrome?	Word Count
madam	✅	1
racecar	✅	1
level	✅	1
never odd or even	✅	4
hello	❌	1

🛠️ Developer Notes
All data is stored temporarily in memory, not in a database.

Restarting the server clears all stored analyses.

The project is Swagger-documented, making it easy to test each endpoint directly in your browser.

💡 Author
Glory Oparaocha
📧 mglory360@gmail.com

