// 本文件来自总纲契约 v1.0，禁止本地修改
export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface TagCreateDTO {
  name: string;
  color: string;
}

export interface TagUpdateDTO {
  name?: string;
  color?: string;
}
