export class UnauthorizedError extends Error {
  constructor(message = "Bạn cần đăng nhập để thực hiện thao tác này") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Bạn không có quyền thực hiện thao tác này") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Không tìm thấy dữ liệu yêu cầu") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class InvalidStateError extends Error {
  constructor(message = "Trạng thái hiện tại không hợp lệ cho thao tác này") {
    super(message);
    this.name = "InvalidStateError";
  }
}

export class ConflictError extends Error {
  constructor(message = "Dữ liệu bị trùng lặp hoặc xung đột") {
    super(message);
    this.name = "ConflictError";
  }
}

export class ValidationError extends Error {
  constructor(message = "Dữ liệu đầu vào không hợp lệ") {
    super(message);
    this.name = "ValidationError";
  }
}
