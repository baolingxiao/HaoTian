// DuckDB WASM 客户端封装
// Why: 封装 DuckDB 初始化和常用操作，简化使用
// How: 提供单例模式的数据库连接和查询方法

import * as duckdb from "@duckdb/duckdb-wasm";
import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

class DuckDBClient {
  private static instance: DuckDBClient | null = null;
  private db: AsyncDuckDB | null = null;
  private conn: AsyncDuckDBConnection | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): DuckDBClient {
    if (!DuckDBClient.instance) {
      DuckDBClient.instance = new DuckDBClient();
    }
    return DuckDBClient.instance;
  }

  /**
   * 初始化 DuckDB
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log("[DuckDB] Initializing...");

      // 选择合适的 bundle
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

      // 选择 MVP bundle（最小化，兼容性最好）
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      // 实例化 worker
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();

      // 初始化数据库
      this.db = await duckdb.createDB(bundle, logger, worker);

      // 创建连接
      this.conn = await this.db.connect();

      // 初始化数据库模式
      await this.initSchema();

      this.isInitialized = true;
      console.log("[DuckDB] Initialization complete");
    } catch (error) {
      console.error("[DuckDB] Initialization failed:", error);
      throw error;
    }
  }

  /**
   * 初始化数据库表结构
   */
  private async initSchema(): Promise<void> {
    if (!this.conn) {
      throw new Error("Database not initialized");
    }

    console.log("[DuckDB] Creating schema...");

    // 用户配置表
    await this.conn.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        mbti VARCHAR,
        preferences JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 聊天摘要表
    await this.conn.query(`
      CREATE TABLE IF NOT EXISTS chat_summaries (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        title VARCHAR NOT NULL,
        summary TEXT,
        key_points JSON,
        emotions JSON,
        message_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 聊天消息表
    await this.conn.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR PRIMARY KEY,
        chat_id VARCHAR NOT NULL,
        role VARCHAR NOT NULL,
        content TEXT NOT NULL,
        emotion VARCHAR,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("[DuckDB] Schema created");
  }

  /**
   * 执行查询
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.conn) {
      throw new Error("Database not initialized");
    }

    try {
      const result = await this.conn.query(sql);
      return result.toArray().map((row) => row.toJSON()) as T[];
    } catch (error) {
      console.error("[DuckDB] Query failed:", sql, error);
      throw error;
    }
  }

  /**
   * 执行单条语句（INSERT, UPDATE, DELETE）
   */
  async execute(sql: string): Promise<void> {
    if (!this.conn) {
      throw new Error("Database not initialized");
    }

    try {
      await this.conn.query(sql);
    } catch (error) {
      console.error("[DuckDB] Execute failed:", sql, error);
      throw error;
    }
  }

  /**
   * 插入单条记录
   */
  async insert(table: string, data: Record<string, any>): Promise<void> {
    const columns = Object.keys(data);
    const values = Object.values(data);

    const placeholders = values
      .map((v) => {
        if (v === null || v === undefined) return "NULL";
        if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
        if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
        return String(v);
      })
      .join(", ");

    const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
    await this.execute(sql);
  }

  /**
   * 更新记录
   */
  async update(
    table: string,
    data: Record<string, any>,
    where: string
  ): Promise<void> {
    const setClauses = Object.entries(data)
      .map(([key, value]) => {
        if (value === null || value === undefined) return `${key} = NULL`;
        if (typeof value === "string") return `${key} = '${value.replace(/'/g, "''")}'`;
        if (typeof value === "object")
          return `${key} = '${JSON.stringify(value).replace(/'/g, "''")}'`;
        return `${key} = ${value}`;
      })
      .join(", ");

    const sql = `UPDATE ${table} SET ${setClauses} WHERE ${where}`;
    await this.execute(sql);
  }

  /**
   * 删除记录
   */
  async delete(table: string, where: string): Promise<void> {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    await this.execute(sql);
  }

  /**
   * 清空所有数据
   */
  async clearAll(): Promise<void> {
    if (!this.conn) {
      throw new Error("Database not initialized");
    }

    await this.execute("DELETE FROM chat_messages");
    await this.execute("DELETE FROM chat_summaries");
    await this.execute("DELETE FROM user_profiles");

    console.log("[DuckDB] All data cleared");
  }

  /**
   * 导出数据库为 JSON
   * 在 Tauri 环境中，可以直接保存到文件系统
   */
  async exportData(): Promise<Blob> {
    if (!this.conn) {
      throw new Error("Database not initialized");
    }

    const [profiles, summaries, messages] = await Promise.all([
      this.query("SELECT * FROM user_profiles"),
      this.query("SELECT * FROM chat_summaries"),
      this.query("SELECT * FROM chat_messages"),
    ]);

    const data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      profiles,
      summaries,
      messages,
    };

    return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  }

  /**
   * 导出数据到文件（仅 Tauri 环境）
   */
  async exportToFile(filename: string): Promise<boolean> {
    try {
      // 检查是否在 Tauri 环境
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const blob = await this.exportData();
        const text = await blob.text();
        
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { writeTextFile } = await import('@tauri-apps/plugin-fs');
        
        const filePath = await save({
          defaultPath: filename,
          filters: [{
            name: 'JSON',
            extensions: ['json']
          }]
        });
        
        if (filePath) {
          await writeTextFile(filePath, text);
          console.log('[DuckDB] Data exported to:', filePath);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[DuckDB] Export to file failed:', error);
      return false;
    }
  }

  /**
   * 导入数据
   */
  async importData(blob: Blob): Promise<void> {
    const text = await blob.text();
    const data = JSON.parse(text);

    // 清空现有数据
    await this.clearAll();

    // 导入数据
    if (data.profiles) {
      for (const profile of data.profiles) {
        await this.insert("user_profiles", profile);
      }
    }

    if (data.summaries) {
      for (const summary of data.summaries) {
        await this.insert("chat_summaries", summary);
      }
    }

    if (data.messages) {
      for (const message of data.messages) {
        await this.insert("chat_messages", message);
      }
    }

    console.log("[DuckDB] Data imported successfully");
  }

  /**
   * 获取数据库统计信息
   */
  async getStats(): Promise<{
    profiles: number;
    summaries: number;
    messages: number;
  }> {
    const [profileCount] = await this.query<{ count: number }>(
      "SELECT COUNT(*) as count FROM user_profiles"
    );
    const [summaryCount] = await this.query<{ count: number }>(
      "SELECT COUNT(*) as count FROM chat_summaries"
    );
    const [messageCount] = await this.query<{ count: number }>(
      "SELECT COUNT(*) as count FROM chat_messages"
    );

    return {
      profiles: profileCount.count || 0,
      summaries: summaryCount.count || 0,
      messages: messageCount.count || 0,
    };
  }

  /**
   * 销毁连接
   */
  async destroy(): Promise<void> {
    if (this.conn) {
      await this.conn.close();
      this.conn = null;
    }

    if (this.db) {
      await this.db.terminate();
      this.db = null;
    }

    this.isInitialized = false;
    DuckDBClient.instance = null;

    console.log("[DuckDB] Connection closed");
  }

  /**
   * 检查是否已初始化
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

// 导出单例实例
export const duckDBClient = DuckDBClient.getInstance();

