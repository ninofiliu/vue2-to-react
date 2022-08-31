const removeFields = (obj: unknown, fields: string[]) => {
  if (obj === null || typeof obj !== "object") return;
  for (const key in obj) {
    if (fields.includes(key)) {
      delete obj[key as keyof typeof obj];
    } else {
      removeFields(obj[key as keyof typeof obj], fields);
    }
  }
};

const ignoredFields = [
  "column",
  "comments",
  "end",
  "errors",
  "extra",
  "index",
  "loc",
  "start",
];

export default (value: unknown) => removeFields(value, ignoredFields);
