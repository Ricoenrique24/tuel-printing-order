import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

    // --- DEPLOYED MODE (Cloud Run / Google Host) ---
    if (PYTHON_SERVICE_URL) {
      const backendFormData = new FormData();
      backendFormData.append("file", file);

      const response = await fetch(`${PYTHON_SERVICE_URL}/analyze`, {
        method: "POST",
        body: backendFormData,
      });

      if (!response.ok) {
        throw new Error(`Cloud Run error: ${response.statusText}`);
      }

      const result = await response.json();
      return NextResponse.json(result);
    }

    // --- LOCAL MODE (Local Development) ---
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `upload_${Date.now()}_${file.name}`);
    fs.writeFileSync(tempPath, buffer);

    const pythonScriptPath = path.join(process.cwd(), "src/lib/python/analyzer.py");

    const startTime = Date.now();
    const result: any = await new Promise((resolve, reject) => {
      // On some Windows systems, use 'python', on Linux 'python3'
      const pythonProcess = spawn("python", [pythonScriptPath, tempPath]);
      let stdout = "";
      let stderr = "";

      pythonProcess.on("error", (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });

      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          return;
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });
    });

    const processingTimeMs = Date.now() - startTime;
    return NextResponse.json({ ...result, processingTimeMs });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
