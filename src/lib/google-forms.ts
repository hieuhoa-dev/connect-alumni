import { forms_v1, google } from "googleapis";
import crypto from "crypto";

export interface GoogleFormExportPayload {
  title: string;
  description: string;
  questions: Array<{
    label: string;
    questionType: string;
    options?: string[] | null;
    isRequired?: boolean;
    config?: {
      min?: number;
      max?: number;
      minLabel?: string;
      maxLabel?: string;
    } | null;
  }>;
}

/**
 * Tạo token bí mật ngẫu nhiên cho Webhook
 */
export const generateWebhookSecret = (): string => {
  return crypto.randomBytes(24).toString("hex");
};

/**
 * Sinh mã Google Apps Script để người dùng gắn vào Google Form / Google Sheets
 * Khi có câu trả lời mới, script sẽ tự động gửi webhook POST về server app
 */
export const generateAppsScriptCode = (options: {
  formId: string;
  webhookSecret: string;
  endpointUrl: string;
}): string => {
  const { formId, webhookSecret, endpointUrl } = options;

  return `/**
 * =======================================================================
 * GOOGLE APPS SCRIPT CHO GOOGLE FORM - HỆ THỐNG KHOA CNTT DLU
 * Tự động gửi kết quả khảo sát về Website Connect Alumni qua Webhook
 * =======================================================================
 *
 * ⚠️ LƯU Ý KHI CHẠY THỬ NGHIỆM TRÊN MÁY LOCAL (LOCALHOST):
 * - Google Apps Script chạy trên đám mây của Google, không thể gọi trực tiếp "http://localhost:3000".
 * - Khi phát triển ở máy cá nhân, hãy dùng ngrok: chạy 'npx ngrok http 3000' và thay URL ngrok vào APP_WEBHOOK_URL.
 * - Khi hệ thống đã có domain thực tế (Vercel/Cloud), webhook sẽ hoạt động tự động.
 *
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở Google Form của bạn
 * 2. Bấm vào biểu tượng 3 chấm (Góc trên bên phải) -> Chọn "Trình chỉnh sửa tập lệnh" (Script editor)
 * 3. Xóa hết mã cũ trong file Code.gs, dán toàn bộ đoạn mã này vào.
 * 4. Bấm icon Save (Lưu dự án).
 * 5. Bấm vào biểu tượng Đồng hồ ở thanh bên trái ("Kích hoạt" / "Triggers"):
 *    - Bấm nút "+ Thêm trình kích hoạt" (Add Trigger) ở góc dưới phải.
 *    - Chọn hàm chạy: "onFormSubmit"
 *    - Chọn nguồn sự kiện: "Từ biểu mẫu" (From form)
 *    - Chọn loại sự kiện: "Khi gửi biểu mẫu" (On form submit)
 *    - Bấm "Lưu" (Cấp quyền truy cập cho script nếu Google yêu cầu).
 *
 * ĐỂ KIỂM TRA THỬ: Chọn hàm "testWebhook" ở thanh công cụ phía trên rồi bấm "Chạy" (Run)!
 * =======================================================================
 */

var CONFIG = {
  APP_WEBHOOK_URL: "${endpointUrl}",
  FORM_ID: "${formId}",
  WEBHOOK_SECRET: "${webhookSecret}"
};

/**
 * Hàm này tự động kích hoạt khi có người dùng gửi biểu mẫu Google Form
 */
function onFormSubmit(e) {
  try {
    // Nếu bấm nút 'Chạy' thủ công trong Script Editor thì biến 'e' sẽ không có
    if (!e) {
      Logger.log("⚠️ BẠN VỪA BẤM NÚT 'CHẠY' THỦ CÔNG: Biến sự kiện 'e' chưa có.");
      Logger.log("👉 Để thử nghiệm kết nối Webhook, hãy chọn hàm 'testWebhook' ở menu trên rồi bấm 'Chạy' (Run).");
      Logger.log("👉 Hoặc mở link Google Form, tự điền một câu trả lời rồi bấm Gửi để kích hoạt tự động.");
      return;
    }

    var respondentEmail = "";
    var answers = [];

    // Trường hợp 1: Script gắn trực tiếp từ Google Form
    if (e.response) {
      var formResponse = e.response;
      try {
        respondentEmail = formResponse.getRespondentEmail() || "";
      } catch (err) {
        respondentEmail = "";
      }

      var itemResponses = formResponse.getItemResponses();
      for (var i = 0; i < itemResponses.length; i++) {
        var item = itemResponses[i];
        answers.push({
          question: item.getItem().getTitle(),
          answer: item.getResponse()
        });
      }
    } 
    // Trường hợp 2: Script gắn từ Google Sheets (Bảng tính liên kết với Form)
    else if (e.namedValues) {
      for (var colTitle in e.namedValues) {
        if (colTitle === "Dấu thời gian" || colTitle === "Timestamp") continue;
        if (colTitle.toLowerCase().indexOf("email") !== -1) {
          respondentEmail = e.namedValues[colTitle][0];
        }
        answers.push({
          question: colTitle,
          answer: e.namedValues[colTitle][0]
        });
      }
    }

    var payload = {
      formId: CONFIG.FORM_ID,
      respondentEmail: respondentEmail,
      submittedAt: new Date().toISOString(),
      answers: answers
    };

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      headers: {
        "x-webhook-secret": CONFIG.WEBHOOK_SECRET
      },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(CONFIG.APP_WEBHOOK_URL, options);
    Logger.log("✓ Kết quả Webhook - Mã HTTP: " + response.getResponseCode());
    Logger.log("✓ Phản hồi từ server: " + response.getContentText());
  } catch (error) {
    Logger.log("❌ Lỗi khi gửi webhook: " + error.toString());
  }
}

/**
 * Hàm kiểm tra thử nghiệm Webhook: Bạn có thể chọn hàm này và bấm nút "Chạy" (Run) trực tiếp!
 */
function testWebhook() {
  Logger.log("🚀 Đang gửi dữ liệu thử nghiệm đến Webhook: " + CONFIG.APP_WEBHOOK_URL);
  
  var testPayload = {
    formId: CONFIG.FORM_ID,
    respondentEmail: "alumni.test@dlu.edu.vn",
    submittedAt: new Date().toISOString(),
    answers: [
      { question: "Họ và tên", answer: "Nguyễn Văn Thử Nghiệm" },
      { question: "Tình trạng việc làm", answer: "Đang làm việc đúng chuyên ngành" }
    ]
  };

  try {
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(testPayload),
      headers: {
        "x-webhook-secret": CONFIG.WEBHOOK_SECRET
      },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(CONFIG.APP_WEBHOOK_URL, options);
    Logger.log("=========================================");
    Logger.log("Mã phản hồi (HTTP Code): " + response.getResponseCode());
    Logger.log("Nội dung trả về: " + response.getContentText());
    Logger.log("=========================================");
    
    if (response.getResponseCode() === 200) {
      Logger.log("🎉 XIN CHÚC MỪNG: Webhook đã kết nối thành công và ghi nhận kết quả!");
    } else {
      Logger.log("⚠️ Webhook trả về lỗi, hãy kiểm tra lại đường dẫn APP_WEBHOOK_URL hoặc máy chủ.");
    }
  } catch (err) {
    Logger.log("❌ Lỗi kết nối Webhook: " + err.toString());
  }
}
`;
};

/**
 * Khởi tạo Google Forms Client nếu có Service Account
 */
const getGoogleFormsClient = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!clientEmail || !privateKey) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/forms.body",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });

  return google.forms({ version: "v1", auth });
};

/**
 * Tự động tạo Google Form từ danh sách câu hỏi qua Google Forms API v1
 */
export const createGoogleFormFromQuestions = async (
  payload: GoogleFormExportPayload,
): Promise<{
  formId: string;
  responderUri: string;
  editUri: string;
}> => {
  const formsApi = getGoogleFormsClient();

  if (!formsApi) {
    throw new Error(
      "Hệ thống chưa được cấu hình GOOGLE_SERVICE_ACCOUNT_EMAIL và GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY. Vui lòng dán liên kết Google Form thủ công hoặc liên hệ quản trị viên.",
    );
  }

  // 1. Khởi tạo Google Form trống
  const createRes = await formsApi.forms.create({
    requestBody: {
      info: {
        title: payload.title,
        documentTitle: payload.title,
        description: payload.description,
      },
    },
  });

  const createdFormId = createRes.data.formId;
  const responderUri = createRes.data.responderUri;

  if (!createdFormId) {
    throw new Error("Không thể tạo Google Form: Google không trả về formId.");
  }

  // 2. Chuẩn bị danh sách requests để thêm từng câu hỏi vào Form
  const requests: forms_v1.Schema$Request[] = [];

  payload.questions.forEach((q, index) => {
    let questionItem: forms_v1.Schema$QuestionItem | null = null;

    if (q.questionType === "short_text") {
      questionItem = {
        question: {
          required: q.isRequired ?? false,
          textQuestion: { paragraph: false },
        },
      };
    } else if (q.questionType === "long_text") {
      questionItem = {
        question: {
          required: q.isRequired ?? false,
          textQuestion: { paragraph: true },
        },
      };
    } else if (q.questionType === "single_choice") {
      const options = (q.options || ["Lựa chọn 1", "Lựa chọn 2"]).map(
        (opt) => ({ value: opt }),
      );
      questionItem = {
        question: {
          required: q.isRequired ?? false,
          choiceQuestion: {
            type: "RADIO",
            options,
          },
        },
      };
    } else if (q.questionType === "multi_choice") {
      const options = (q.options || ["Lựa chọn 1", "Lựa chọn 2"]).map(
        (opt) => ({ value: opt }),
      );
      questionItem = {
        question: {
          required: q.isRequired ?? false,
          choiceQuestion: {
            type: "CHECKBOX",
            options,
          },
        },
      };
    } else if (q.questionType === "scale") {
      const low = q.config?.min ?? 1;
      const high = q.config?.max ?? 5;
      questionItem = {
        question: {
          required: q.isRequired ?? false,
          scaleQuestion: {
            low,
            high,
            lowLabel: q.config?.minLabel || "Rất kém",
            highLabel: q.config?.maxLabel || "Rất tốt",
          },
        },
      };
    } else {
      questionItem = {
        question: {
          required: q.isRequired ?? false,
          textQuestion: { paragraph: true },
        },
      };
    }

    requests.push({
      createItem: {
        item: {
          title: q.label,
          questionItem,
        },
        location: {
          index,
        },
      },
    });
  });

  if (requests.length > 0) {
    await formsApi.forms.batchUpdate({
      formId: createdFormId,
      requestBody: {
        requests,
      },
    });
  }

  const editUri = `https://docs.google.com/forms/d/${createdFormId}/edit`;

  return {
    formId: createdFormId,
    responderUri: responderUri || `https://docs.google.com/forms/d/e/${createdFormId}/viewform`,
    editUri,
  };
};
