機器人馬達角度計算機

資料夾內容：
- index.html
- style.css
- script.js
- README.txt

使用方式：
1. 打開 index.html 就可以直接使用。
2. 若要放到 GitHub Pages，請把整個資料夾內的檔案上傳到 Repository 根目錄。
3. 到 GitHub 的 Settings → Pages。
4. Source 選 Deploy from a branch。
5. Branch 選 main，資料夾選 /(root)。
6. 等 1～3 分鐘後即可開啟網站。

功能：
- 輸入公分，自動換算馬達角度。
- 右上角設定可切換：
  1. 萬用輪子公式模式
  2. 實測校正模式
- 萬用模式只需要設定輪子直徑。
- 實測模式可以修改三組實測資料。
- 支援儲存設定與實測資料。
- 有滑鼠細尾翼效果。

萬用公式：
角度 = 目標公分 ÷ (輪子直徑 × π) × 360

實測模式：
用最接近的兩組實測資料做分段換算。
