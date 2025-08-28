export const successResponse = (data: any, message = "success") => {
    return { success: true, message, data };
};

export const erorrResponse = (message = "Error", code = 500) => {
    return { success: false, message, code };
};