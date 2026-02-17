# 🔧 Examples

This page showcases comprehensive examples of Cano TS in real-world scenarios, including error handling and the E module's array utilities.

## 🚨 Error Handling Examples

### API Error Recovery
```typescript
import { pipe } from "cano-ts";

async function fetchUserProfile(userId: number) {
  const response = await fetch(`https://api.example.com/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user ${userId}: ${response.statusText}`);
  }
  return response.json();
}

async function fetchUserPosts(userId: number) {
  const response = await fetch(`https://api.example.com/users/${userId}/posts`);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

async function enrichProfile(profile: any, posts: any[]) {
  return {
    ...profile,
    postCount: posts.length,
    lastPost: posts[0]?.title || "No posts"
  };
}

// Gracefully handle API failures
const userProfile = await pipe(999) // Non-existent user
  .next(fetchUserProfile)
  .catch((error) => {
    console.error("API Error:", error.message);
    // Return a default guest profile
    return {
      id: 0,
      name: "Guest User",
      email: "guest@example.com"
    };
  })
  .next(async (profile) => {
    if (profile.id === 0) return []; // Skip fetching posts for guest
    return fetchUserPosts(profile.id);
  })
  .catch(() => []) // Handle posts fetch failure
  .next((posts) => enrichProfile(
    { id: 0, name: "Guest User", email: "guest@example.com" },
    posts
  ))
  .result();

console.log(userProfile);
// { id: 0, name: "Guest User", email: "guest@example.com", postCount: 0, lastPost: "No posts" }
```

### Data Validation Pipeline
```typescript
import { pipeSync } from "cano-ts";

interface UserInput {
  email: string;
  age: number;
  password: string;
}

function validateEmail(input: UserInput) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new Error("Invalid email format");
  }
  return input;
}

function validateAge(input: UserInput) {
  if (input.age < 18 || input.age > 120) {
    throw new Error("Age must be between 18 and 120");
  }
  return input;
}

function validatePassword(input: UserInput) {
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  return input;
}

function hashPassword(input: UserInput) {
  return {
    ...input,
    password: `hashed_${input.password}` // Simplified for example
  };
}

// Validate user input with detailed error handling
const validatedUser = pipeSync({
  email: "invalid-email", // Invalid!
  age: 25,
  password: "securepass123"
})
  .next(validateEmail)
  .next(validateAge)
  .next(validatePassword)
  .catch((error) => {
    console.error("Validation failed:", error.message);
    // Return validation error response
    return {
      error: true,
      message: error.message,
      field: error.message.includes("email") ? "email" :
             error.message.includes("age") ? "age" : "password"
    };
  })
  .result();

console.log(validatedUser);
// { error: true, message: "Invalid email format", field: "email" }
```

### File Processing with Fallbacks
```typescript
import { pipe } from "cano-ts";
import * as fs from "fs/promises";

async function readConfigFile(path: string) {
  try {
    const content = await fs.readFile(path, "utf-8");
    return JSON.parse(content);
  } catch {
    throw new Error(`Config file not found: ${path}`);
  }
}

async function validateConfig(config: any) {
  const required = ["apiKey", "endpoint", "timeout"];
  for (const field of required) {
    if (!config[field]) {
      throw new Error(`Missing required config field: ${field}`);
    }
  }
  return config;
}

async function initializeService(config: any) {
  return {
    service: "MyService",
    config,
    status: "initialized"
  };
}

// Try primary config, fallback to defaults on error
const service = await pipe("./config.json")
  .next(readConfigFile)
  .catch(() => {
    console.log("Primary config failed, trying fallback...");
    return readConfigFile("./config.default.json");
  })
  .catch(() => {
    console.log("All configs failed, using hardcoded defaults");
    return {
      apiKey: "demo_key",
      endpoint: "https://api.example.com",
      timeout: 5000
    };
  })
  .next(validateConfig)
  .catch((error) => {
    console.error("Config validation failed:", error.message);
    // Use minimal safe defaults
    return {
      apiKey: "safe_demo_key",
      endpoint: "https://api.example.com",
      timeout: 3000
    };
  })
  .next(initializeService)
  .result();

console.log(service);
```

### Database Transaction Rollback
```typescript
import { pipe } from "cano-ts";

// Simulated database operations
const db = {
  transactions: [] as any[],

  async beginTransaction() {
    const txId = Date.now();
    this.transactions.push({ id: txId, operations: [] });
    return txId;
  },

  async executeQuery(txId: number, query: string, data: any) {
    const tx = this.transactions.find(t => t.id === txId);
    if (!tx) throw new Error("Transaction not found");

    // Simulate failure on specific operations
    if (query.includes("invalid")) {
      throw new Error("Database constraint violation");
    }

    tx.operations.push({ query, data });
    return { success: true, affectedRows: 1 };
  },

  async commit(txId: number) {
    const tx = this.transactions.find(t => t.id === txId);
    if (!tx) throw new Error("Transaction not found");
    console.log(`✓ Committed ${tx.operations.length} operations`);
    return { committed: true, operations: tx.operations.length };
  },

  async rollback(txId: number) {
    this.transactions = this.transactions.filter(t => t.id !== txId);
    console.log("✗ Transaction rolled back");
    return { rolledBack: true };
  }
};

// Complex transaction with automatic rollback on error
const result = await pipe(null)
  .next(() => db.beginTransaction())
  .next(async (txId) => {
    await db.executeQuery(txId, "INSERT INTO users", { name: "Alice" });
    await db.executeQuery(txId, "INSERT INTO profiles", { userId: 1 });
    await db.executeQuery(txId, "INSERT invalid data", { bad: "data" }); // This will fail!
    return txId;
  })
  .catch(async (error) => {
    console.error("Transaction failed:", error.message);
    // Rollback is handled in catch
    // In real scenario, txId would be passed through error context
    return { error: true, message: error.message };
  })
  .next(async (txIdOrError) => {
    if (typeof txIdOrError === "object" && txIdOrError.error) {
      return txIdOrError; // Pass error through
    }
    return db.commit(txIdOrError);
  })
  .result();

console.log(result);
```

### Retry Logic with Exponential Backoff
```typescript
import { pipe } from "cano-ts";

async function unreliableApiCall(attempt: number = 1) {
  console.log(`Attempt ${attempt}...`);

  // Simulate random failures (70% failure rate)
  if (Math.random() < 0.7) {
    throw new Error("Service temporarily unavailable");
  }

  return { data: "Success!", attempt };
}

async function retryWithBackoff(fn: () => Promise<any>, maxRetries: number = 3) {
  let attempt = 0;
  let lastError: Error;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      attempt++;

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retry in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// API call with retry logic
const apiResult = await pipe(null)
  .next(() => unreliableApiCall())
  .catch(() => retryWithBackoff(() => unreliableApiCall(2)))
  .catch(() => retryWithBackoff(() => unreliableApiCall(3)))
  .catch((error) => {
    console.error("All retries failed:", error.message);
    return { data: "Cached fallback data", fromCache: true };
  })
  .result();

console.log("Final result:", apiResult);
```

## 📊 Data Analysis Examples

### Sales Analytics Dashboard
```typescript
import { pipeSync, E } from "cano-ts";

const salesData = [
  { id: 1, rep: "Alice", product: "Laptop", amount: 1299, quarter: "Q1", region: "North" },
  { id: 2, rep: "Bob", product: "Phone", amount: 699, quarter: "Q1", region: "South" },
  { id: 3, rep: "Charlie", product: "Tablet", amount: 399, quarter: "Q2", region: "East" },
  { id: 4, rep: "Alice", product: "Laptop", amount: 1299, quarter: "Q2", region: "North" },
  { id: 5, rep: "Diana", product: "Phone", amount: 699, quarter: "Q2", region: "West" },
  { id: 6, rep: "Bob", product: "Tablet", amount: 399, quarter: "Q3", region: "South" },
  { id: 7, rep: "Eve", product: "Laptop", amount: 1299, quarter: "Q3", region: "East" },
  { id: 8, rep: "Frank", product: "Phone", amount: 699, quarter: "Q4", region: "West" },
];

// Top performing sales reps by total revenue
const topPerformers = pipeSync(salesData)
  .next(E.reduce, (acc, sale) => {
    acc[sale.rep] = (acc[sale.rep] || 0) + sale.amount;
    return acc;
  }, {} as Record<string, number>)
  .next(Object.entries)
  .next(E.sort, ([, a], [, b]) => b - a)
  .next(E.slice, 0, 3)
  .next(E.map, ([rep, total]) => `${rep}: $${total.toLocaleString()}`)
  .next(E.join, "\n")
  .result();

console.log("🏆 Top Sales Performers:");
console.log(topPerformers);
// Alice: $2,598
// Bob: $1,098
// Charlie: $399

// Regional sales breakdown
const regionalBreakdown = pipeSync(salesData)
  .next(E.reduce, (acc, sale) => {
    if (!acc[sale.region]) acc[sale.region] = [];
    acc[sale.region].push(sale.amount);
    return acc;
  }, {} as Record<string, number[]>)
  .next(Object.entries)
  .next(E.map, ([region, amounts]) => ({
    region,
    total: amounts.reduce((sum, amount) => sum + amount, 0),
    avgSale: amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length,
    salesCount: amounts.length
  }))
  .next(E.sort, (a, b) => b.total - a.total)
  .result();

console.log("\n📍 Regional Performance:");
regionalBreakdown.forEach(region => {
  console.log(`${region.region}: $${region.total} (${region.salesCount} sales, avg: $${region.avgSale.toFixed(0)})`);
});
```

### User Engagement Analytics
```typescript
const userActivity = [
  { userId: 1, action: "login", timestamp: "2024-01-15T09:00:00Z", duration: 1800 },
  { userId: 1, action: "view_page", timestamp: "2024-01-15T09:30:00Z", duration: 300 },
  { userId: 2, action: "login", timestamp: "2024-01-15T10:00:00Z", duration: 2400 },
  { userId: 1, action: "purchase", timestamp: "2024-01-15T09:45:00Z", duration: 600 },
  { userId: 3, action: "login", timestamp: "2024-01-15T11:00:00Z", duration: 900 },
  { userId: 2, action: "view_page", timestamp: "2024-01-15T10:30:00Z", duration: 450 },
  { userId: 3, action: "view_page", timestamp: "2024-01-15T11:15:00Z", duration: 200 },
  { userId: 1, action: "logout", timestamp: "2024-01-15T10:00:00Z", duration: 0 },
];

// User engagement summary
const engagementSummary = pipeSync(userActivity)
  .next(E.reduce, (acc, activity) => {
    if (!acc[activity.userId]) {
      acc[activity.userId] = { 
        totalTime: 0, 
        actions: [], 
        sessions: 0,
        purchases: 0 
      };
    }
    
    acc[activity.userId].totalTime += activity.duration;
    acc[activity.userId].actions.push(activity.action);
    
    if (activity.action === "login") acc[activity.userId].sessions++;
    if (activity.action === "purchase") acc[activity.userId].purchases++;
    
    return acc;
  }, {} as Record<number, any>)
  .next(Object.entries)
  .next(E.map, ([userId, data]) => ({
    userId: parseInt(userId),
    totalEngagementMinutes: Math.round(data.totalTime / 60),
    uniqueActions: [...new Set(data.actions)].length,
    sessions: data.sessions,
    purchases: data.purchases,
    avgSessionTime: Math.round(data.totalTime / data.sessions / 60)
  }))
  .next(E.sort, (a, b) => b.totalEngagementMinutes - a.totalEngagementMinutes)
  .result();

console.log("👥 User Engagement Summary:");
engagementSummary.forEach(user => {
  console.log(
    `User ${user.userId}: ${user.totalEngagementMinutes}min total, ` +
    `${user.sessions} sessions (avg: ${user.avgSessionTime}min), ` +
    `${user.purchases} purchases`
  );
});
```

## 🛒 E-commerce Examples

### Product Catalog Management
```typescript
const products = [
  { id: 1, name: "Gaming Laptop", price: 1299, category: "Electronics", stock: 15, rating: 4.5, tags: ["gaming", "laptop", "rgb"] },
  { id: 2, name: "Wireless Mouse", price: 49, category: "Electronics", stock: 50, rating: 4.2, tags: ["wireless", "mouse", "ergonomic"] },
  { id: 3, name: "Coffee Mug", price: 12, category: "Kitchen", stock: 100, rating: 4.8, tags: ["coffee", "ceramic", "dishwasher-safe"] },
  { id: 4, name: "Standing Desk", price: 299, category: "Furniture", stock: 8, rating: 4.3, tags: ["adjustable", "desk", "ergonomic"] },
  { id: 5, name: "Bluetooth Headphones", price: 199, category: "Electronics", stock: 25, rating: 4.6, tags: ["bluetooth", "noise-canceling", "wireless"] },
  { id: 6, name: "Yoga Mat", price: 35, category: "Sports", stock: 30, rating: 4.4, tags: ["yoga", "exercise", "non-slip"] },
  { id: 7, name: "Smartphone", price: 699, category: "Electronics", stock: 0, rating: 4.7, tags: ["smartphone", "5g", "camera"] },
  { id: 8, name: "Office Chair", price: 249, category: "Furniture", stock: 12, rating: 4.1, tags: ["chair", "office", "lumbar-support"] }
];

// Best selling electronics in stock with high ratings
const recommendedElectronics = pipeSync(products)
  .next(E.filter, (product) => product.category === "Electronics")
  .next(E.filter, (product) => product.stock > 0)
  .next(E.filter, (product) => product.rating >= 4.5)
  .next(E.sort, (a, b) => b.rating - a.rating)
  .next(E.map, (product) => ({
    name: product.name,
    price: `$${product.price}`,
    rating: `⭐ ${product.rating}`,
    availability: product.stock > 20 ? "In Stock" : "Limited Stock"
  }))
  .result();

console.log("🎯 Recommended Electronics:");
console.table(recommendedElectronics);

// Price analysis by category
const categoryPriceAnalysis = pipeSync(products)
  .next(E.reduce, (acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product.price);
    return acc;
  }, {} as Record<string, number[]>)
  .next(Object.entries)
  .next(E.map, ([category, prices]) => ({
    category,
    avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    productCount: prices.length
  }))
  .next(E.sort, (a, b) => b.avgPrice - a.avgPrice)
  .result();

console.log("\n💰 Price Analysis by Category:");
categoryPriceAnalysis.forEach(analysis => {
  console.log(
    `${analysis.category}: $${analysis.avgPrice.toFixed(0)} avg ` +
    `($${analysis.minPrice}-$${analysis.maxPrice}, ${analysis.productCount} products)`
  );
});

// Low stock alerts
const lowStockAlerts = pipeSync(products)
  .next(E.filter, (product) => product.stock <= 10 && product.stock > 0)
  .next(E.sort, (a, b) => a.stock - b.stock)
  .next(E.map, (product) => `⚠️  ${product.name}: Only ${product.stock} left!`)
  .next(E.join, "\n")
  .result();

console.log("\n📦 Low Stock Alerts:");
console.log(lowStockAlerts);
```

### Shopping Cart Operations
```typescript
const cartItems = [
  { productId: 1, name: "Gaming Laptop", price: 1299, quantity: 1, category: "Electronics" },
  { productId: 2, name: "Wireless Mouse", price: 49, quantity: 2, category: "Electronics" },
  { productId: 6, name: "Yoga Mat", price: 35, quantity: 1, category: "Sports" },
  { productId: 3, name: "Coffee Mug", price: 12, quantity: 3, category: "Kitchen" }
];

// Cart summary with totals and discounts
const cartSummary = pipeSync(cartItems)
  .next((items) => {
    const itemsWithSubtotal = items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));
    
    return {
      items: itemsWithSubtotal,
      subtotal: itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0),
      itemCount: itemsWithSubtotal.reduce((sum, item) => sum + item.quantity, 0)
    };
  })
  .next((cart) => ({
    ...cart,
    // 10% discount on Electronics over $1000
    electronicsDiscount: cart.items
      .filter(item => item.category === "Electronics")
      .reduce((sum, item) => sum + item.subtotal, 0) > 1000 ? 
      cart.items
        .filter(item => item.category === "Electronics")
        .reduce((sum, item) => sum + item.subtotal, 0) * 0.1 : 0,
    // Free shipping over $100
    shippingCost: cart.subtotal >= 100 ? 0 : 9.99
  }))
  .next((cart) => ({
    ...cart,
    total: cart.subtotal - cart.electronicsDiscount + cart.shippingCost
  }))
  .result();

console.log("🛒 Cart Summary:");
console.log(`Items: ${cartSummary.itemCount}`);
console.log(`Subtotal: $${cartSummary.subtotal.toFixed(2)}`);
if (cartSummary.electronicsDiscount > 0) {
  console.log(`Electronics Discount: -$${cartSummary.electronicsDiscount.toFixed(2)}`);
}
console.log(`Shipping: ${cartSummary.shippingCost === 0 ? "FREE" : `$${cartSummary.shippingCost}`}`);
console.log(`Total: $${cartSummary.total.toFixed(2)}`);

// Most popular categories in cart
const categoryBreakdown = pipeSync(cartItems)
  .next(E.reduce, (acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>)
  .next(Object.entries)
  .next(E.sort, ([, a], [, b]) => b - a)
  .next(E.map, ([category, count]) => `${category}: ${count} items`)
  .next(E.join, " | ")
  .result();

console.log(`\n📊 Categories: ${categoryBreakdown}`);
```

## 🎬 Content Management Examples

### Blog Post Analytics
```typescript
const blogPosts = [
  { id: 1, title: "Getting Started with TypeScript", author: "Alice", publishDate: "2024-01-15", views: 1250, likes: 89, comments: 23, tags: ["typescript", "tutorial", "beginner"], category: "Programming" },
  { id: 2, title: "Advanced React Patterns", author: "Bob", publishDate: "2024-01-20", views: 890, likes: 67, comments: 15, tags: ["react", "patterns", "advanced"], category: "Programming" },
  { id: 3, title: "The Future of AI", author: "Charlie", publishDate: "2024-01-25", views: 2100, likes: 156, comments: 45, tags: ["ai", "machine-learning", "future"], category: "Technology" },
  { id: 4, title: "Healthy Cooking Tips", author: "Diana", publishDate: "2024-01-30", views: 650, likes: 34, comments: 8, tags: ["cooking", "health", "nutrition"], category: "Lifestyle" },
  { id: 5, title: "Docker Best Practices", author: "Alice", publishDate: "2024-02-05", views: 1100, likes: 78, comments: 19, tags: ["docker", "devops", "containers"], category: "Programming" },
  { id: 6, title: "Meditation for Developers", author: "Eve", publishDate: "2024-02-10", views: 420, likes: 28, comments: 12, tags: ["meditation", "wellness", "productivity"], category: "Lifestyle" }
];

// Top performing posts by engagement rate
const topEngagingPosts = pipeSync(blogPosts)
  .next(E.map, (post) => ({
    ...post,
    engagementRate: ((post.likes + post.comments) / post.views * 100)
  }))
  .next(E.sort, (a, b) => b.engagementRate - a.engagementRate)
  .next(E.slice, 0, 3)
  .next(E.map, (post) => ({
    title: post.title,
    author: post.author,
    engagement: `${post.engagementRate.toFixed(1)}%`,
    views: post.views.toLocaleString()
  }))
  .result();

console.log("🔥 Most Engaging Posts:");
console.table(topEngagingPosts);

// Author performance analytics
const authorStats = pipeSync(blogPosts)
  .next(E.reduce, (acc, post) => {
    if (!acc[post.author]) {
      acc[post.author] = { posts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 };
    }
    acc[post.author].posts += 1;
    acc[post.author].totalViews += post.views;
    acc[post.author].totalLikes += post.likes;
    acc[post.author].totalComments += post.comments;
    return acc;
  }, {} as Record<string, any>)
  .next(Object.entries)
  .next(E.map, ([author, stats]) => ({
    author,
    posts: stats.posts,
    avgViews: Math.round(stats.totalViews / stats.posts),
    avgEngagement: Math.round((stats.totalLikes + stats.totalComments) / stats.posts),
    totalReach: stats.totalViews
  }))
  .next(E.sort, (a, b) => b.totalReach - a.totalReach)
  .result();

console.log("\n👨‍💻 Author Performance:");
authorStats.forEach(author => {
  console.log(
    `${author.author}: ${author.posts} posts, ${author.avgViews} avg views, ` +
    `${author.avgEngagement} avg engagement, ${author.totalReach.toLocaleString()} total reach`
  );
});

// Trending topics analysis
const trendingTopics = pipeSync(blogPosts)
  .next(E.map, (post) => post.tags)
  .next(E.flat)
  .next(E.reduce, (acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
  .next(Object.entries)
  .next(E.sort, ([, a], [, b]) => b - a)
  .next(E.slice, 0, 8)
  .next(E.map, ([tag, count]) => `#${tag} (${count})`)
  .next(E.join, " • ")
  .result();

console.log(`\n🏷️  Trending Topics: ${trendingTopics}`);
```

## 📈 Financial Data Processing

### Investment Portfolio Analysis
```typescript
const portfolio = [
  { symbol: "AAPL", shares: 50, purchasePrice: 150, currentPrice: 175, sector: "Technology", dividendYield: 0.5 },
  { symbol: "GOOGL", shares: 20, purchasePrice: 2400, currentPrice: 2650, sector: "Technology", dividendYield: 0 },
  { symbol: "TSLA", shares: 15, purchasePrice: 800, currentPrice: 650, sector: "Automotive", dividendYield: 0 },
  { symbol: "MSFT", shares: 40, purchasePrice: 300, currentPrice: 350, sector: "Technology", dividendYield: 0.7 },
  { symbol: "JPM", shares: 25, purchasePrice: 140, currentPrice: 155, sector: "Financial", dividendYield: 2.3 },
  { symbol: "JNJ", shares: 30, purchasePrice: 160, currentPrice: 165, sector: "Healthcare", dividendYield: 2.8 },
  { symbol: "PG", shares: 35, purchasePrice: 140, currentPrice: 145, sector: "Consumer Goods", dividendYield: 2.5 }
];

// Portfolio performance analysis
const portfolioAnalysis = pipeSync(portfolio)
  .next(E.map, (holding) => ({
    ...holding,
    totalValue: holding.shares * holding.currentPrice,
    totalCost: holding.shares * holding.purchasePrice,
    gain: (holding.currentPrice - holding.purchasePrice) * holding.shares,
    gainPercent: ((holding.currentPrice - holding.purchasePrice) / holding.purchasePrice) * 100,
    annualDividend: holding.shares * holding.currentPrice * (holding.dividendYield / 100)
  }))
  .next((holdings) => {
    const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalGain = holdings.reduce((sum, h) => sum + h.gain, 0);
    const totalDividends = holdings.reduce((sum, h) => sum + h.annualDividend, 0);
    
    return {
      holdings: holdings.map(h => ({
        ...h,
        portfolioWeight: (h.totalValue / totalValue) * 100
      })),
      summary: {
        totalValue,
        totalCost,
        totalGain,
        totalGainPercent: (totalGain / totalCost) * 100,
        totalDividends
      }
    };
  })
  .result();

console.log("📊 Portfolio Summary:");
console.log(`Total Value: $${portfolioAnalysis.summary.totalValue.toLocaleString()}`);
console.log(`Total Gain: $${portfolioAnalysis.summary.totalGain.toLocaleString()} (${portfolioAnalysis.summary.totalGainPercent.toFixed(1)}%)`);
console.log(`Annual Dividends: $${portfolioAnalysis.summary.totalDividends.toLocaleString()}`);

// Best and worst performers
const performers = pipeSync(portfolioAnalysis.holdings)
  .next(E.sort, (a, b) => b.gainPercent - a.gainPercent)
  .next((holdings) => ({
    best: holdings.slice(0, 3),
    worst: holdings.slice(-3).reverse()
  }))
  .result();

console.log("\n🚀 Top Performers:");
performers.best.forEach(stock => {
  console.log(`${stock.symbol}: +${stock.gainPercent.toFixed(1)}% ($${stock.gain.toLocaleString()})`);
});

console.log("\n📉 Underperformers:");
performers.worst.forEach(stock => {
  console.log(`${stock.symbol}: ${stock.gainPercent.toFixed(1)}% ($${stock.gain.toLocaleString()})`);
});

// Sector allocation
const sectorAllocation = pipeSync(portfolioAnalysis.holdings)
  .next(E.reduce, (acc, holding) => {
    acc[holding.sector] = (acc[holding.sector] || 0) + holding.portfolioWeight;
    return acc;
  }, {} as Record<string, number>)
  .next(Object.entries)
  .next(E.sort, ([, a], [, b]) => b - a)
  .next(E.map, ([sector, weight]) => `${sector}: ${weight.toFixed(1)}%`)
  .next(E.join, " | ")
  .result();

console.log(`\n🎯 Sector Allocation: ${sectorAllocation}`);
```

## 🎓 Educational Data Examples

### Student Performance Analysis
```typescript
const studentGrades = [
  { studentId: 1, name: "Alice Johnson", subject: "Mathematics", grade: 92, semester: "Fall", credits: 4 },
  { studentId: 1, name: "Alice Johnson", subject: "Physics", grade: 88, semester: "Fall", credits: 4 },
  { studentId: 1, name: "Alice Johnson", subject: "Chemistry", grade: 85, semester: "Spring", credits: 3 },
  { studentId: 2, name: "Bob Smith", subject: "Mathematics", grade: 78, semester: "Fall", credits: 4 },
  { studentId: 2, name: "Bob Smith", subject: "History", grade: 91, semester: "Fall", credits: 3 },
  { studentId: 2, name: "Bob Smith", subject: "English", grade: 83, semester: "Spring", credits: 3 },
  { studentId: 3, name: "Charlie Brown", subject: "Physics", grade: 95, semester: "Fall", credits: 4 },
  { studentId: 3, name: "Charlie Brown", subject: "Mathematics", grade: 89, semester: "Fall", credits: 4 },
  { studentId: 3, name: "Charlie Brown", subject: "Computer Science", grade: 97, semester: "Spring", credits: 4 }
];

// Calculate GPA for each student
const studentGPAs = pipeSync(studentGrades)
  .next(E.reduce, (acc, record) => {
    if (!acc[record.studentId]) {
      acc[record.studentId] = { 
        name: record.name, 
        totalPoints: 0, 
        totalCredits: 0, 
        subjects: [] 
      };
    }
    
    // Convert grade to GPA points (A=4, B=3, C=2, D=1, F=0)
    const gpaPoints = record.grade >= 90 ? 4 : 
                     record.grade >= 80 ? 3 : 
                     record.grade >= 70 ? 2 : 
                     record.grade >= 60 ? 1 : 0;
    
    acc[record.studentId].totalPoints += gpaPoints * record.credits;
    acc[record.studentId].totalCredits += record.credits;
    acc[record.studentId].subjects.push({
      subject: record.subject,
      grade: record.grade,
      semester: record.semester
    });
    
    return acc;
  }, {} as Record<number, any>)
  .next(Object.values)
  .next(E.map, (student: any) => ({
    name: student.name,
    gpa: (student.totalPoints / student.totalCredits).toFixed(2),
    credits: student.totalCredits,
    subjects: student.subjects.length,
    avgGrade: (student.subjects.reduce((sum: number, s: any) => sum + s.grade, 0) / student.subjects.length).toFixed(1)
  }))
  .next(E.sort, (a, b) => parseFloat(b.gpa) - parseFloat(a.gpa))
  .result();

console.log("🎓 Student Academic Performance:");
console.table(studentGPAs);

// Subject difficulty analysis (based on grade distribution)
const subjectAnalysis = pipeSync(studentGrades)
  .next(E.reduce, (acc, record) => {
    if (!acc[record.subject]) acc[record.subject] = [];
    acc[record.subject].push(record.grade);
    return acc;
  }, {} as Record<string, number[]>)
  .next(Object.entries)
  .next(E.map, ([subject, grades]) => ({
    subject,
    avgGrade: grades.reduce((sum, grade) => sum + grade, 0) / grades.length,
    minGrade: Math.min(...grades),
    maxGrade: Math.max(...grades),
    students: grades.length,
    difficulty: grades.reduce((sum, grade) => sum + grade, 0) / grades.length < 85 ? "Hard" : "Moderate"
  }))
  .next(E.sort, (a, b) => a.avgGrade - b.avgGrade)
  .result();

console.log("\n📚 Subject Difficulty Analysis:");
subjectAnalysis.forEach(subject => {
  console.log(
    `${subject.subject}: ${subject.avgGrade.toFixed(1)} avg (${subject.difficulty}) - ` +
    `Range: ${subject.minGrade}-${subject.maxGrade}, ${subject.students} students`
  );
});
```

These examples demonstrate the power and flexibility of the E module when combined with Cano TS pipelines. Each example shows how complex data transformations can be broken down into simple, readable steps that are easy to understand and maintain.