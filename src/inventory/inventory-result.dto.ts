export class InventoryResultDto {
  soko_cd: string; // 倉庫コード
  soko_name: string; // 倉庫名
  hin_cd: string; // 品目CD
  hin_name: string; // 品目名
  model_no: string; // 規格
  stock: number; // 在庫数（t_inventory になければ 0）
}
