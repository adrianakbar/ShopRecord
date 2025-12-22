import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface ParsedExpense {
  item: string;
  amount: number;
  category: string;
  date: string; // ISO format
  confidence: number; // 0-100
}

export interface ParseResult {
  success: boolean;
  expenses: ParsedExpense[];
  originalText: string;
  error?: string;
}

const SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu parsing data pengeluaran dari teks natural language bahasa Indonesia.

TUGAS:
1. Parse teks input menjadi data pengeluaran terstruktur
2. Identifikasi: item, harga, kategori, dan tanggal
3. Dukung multiple transaksi dalam satu input
4. Return JSON array dengan format yang konsisten

KATEGORI YANG TERSEDIA:
- Food & Dining (makanan, makan siang, dinner, restaurant)
- Groceries (belanja, pasar, supermarket, bahan makanan)
- Transportation (transport, ojek, uber, bensin, parkir)
- Utilities (listrik, air, internet, pulsa)
- Entertainment (hiburan, bioskop, netflix, game)
- Shopping (belanja barang, fashion, elektronik)
- Healthcare (kesehatan, obat, dokter, rumah sakit)
- Coffee & Cafe (kopi, cafe, starbucks)

TANGGAL:
- "kemarin" = 1 hari yang lalu
- "2 hari lalu" = 2 hari yang lalu
- "minggu lalu" = 7 hari yang lalu
- Tanggal spesifik: parse ke format ISO
- Jika tidak disebutkan = hari ini

HARGA:
- Support: "19rb", "19k", "19.000", "19000"
- Support: "50rb", "1jt", "1,5jt"

CONFIDENCE SCORE:
- 100: Semua field jelas dan pasti
- 80-99: Sebagian besar jelas, ada sedikit asumsi
- 60-79: Beberapa field butuh asumsi
- <60: Banyak field tidak jelas

CONTOH INPUT & OUTPUT:

Input: "beli dada ayam mentah 19 rb kemarin"
Output:
[{
  "item": "Dada Ayam Mentah",
  "amount": 19000,
  "category": "Groceries",
  "date": "2025-12-21",
  "confidence": 95
}]

Input: "makan siang 35rb, kopi 15k"
Output:
[{
  "item": "Makan Siang",
  "amount": 35000,
  "category": "Food & Dining",
  "date": "2025-12-22",
  "confidence": 90
}, {
  "item": "Kopi",
  "amount": 15000,
  "category": "Coffee & Cafe",
  "date": "2025-12-22",
  "confidence": 90
}]

PENTING:
- Return HANYA valid JSON array, tanpa markdown atau teks tambahan
- Jika tidak bisa parse: return array kosong []
- Gunakan tanggal hari ini sebagai reference: ${new Date().toISOString().split('T')[0]}`;

export async function parseExpenseWithAI(text: string): Promise<ParseResult> {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `${SYSTEM_PROMPT}

USER INPUT: "${text}"

OUTPUT (JSON array only):`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Clean response - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    // Parse JSON
    const expenses = JSON.parse(cleanedText);

    // Validate structure
    if (!Array.isArray(expenses)) {
      throw new Error('Response is not an array');
    }

    // Validate each expense
    const validatedExpenses: ParsedExpense[] = expenses.map((exp: unknown) => {
      const expense = exp as Record<string, unknown>;
      return {
        item: String(expense.item || 'Unknown Item'),
        amount: Number(expense.amount || 0),
        category: String(expense.category || 'Shopping'),
        date: String(expense.date || new Date().toISOString().split('T')[0]),
        confidence: Number(expense.confidence || 50),
      };
    });

    return {
      success: true,
      expenses: validatedExpenses,
      originalText: text,
    };
  } catch (error) {
    console.error('AI Parsing Error:', error);
    return {
      success: false,
      expenses: [],
      originalText: text,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function testAIConnection(): Promise<boolean> {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return false;
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Test connection. Reply with: OK');
    const text = result.response.text();
    return text.toLowerCase().includes('ok');
  } catch {
    return false;
  }
}
