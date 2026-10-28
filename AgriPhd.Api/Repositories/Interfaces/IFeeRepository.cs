namespace AgriPhd.Api.Repositories.Interfaces;

public interface IFeeRepository
{
    Task<IEnumerable<dynamic>> GetTransactionHistoryAsync(long payeeId);
    Task<dynamic?> GetTransactionDetailsAsync(long transactionId);
    Task<long> SetFeeTransactionAsync(long payeeId, short phaseId, short gatewayId, string userLoginId, string ipAddress);
    Task<bool> SetOrderIdForRazorpayAsync(long transactionId, string orderId);
    Task<bool> SetFeeTransactionResponseAsync(long transactionId, string paymentId, string orderId, string signature, string bankRef, string status, string userLoginId, string ipAddress);
    Task<IEnumerable<dynamic>> GetFailedTransactionsForApiCheckAsync(long payeeId);
    Task<IEnumerable<dynamic>> GetTransactionsForRefundAsync(string input);
    Task<bool> UpdateRefundStatusAsync(long transactionId, string refundId, string status, string userLoginId, string ipAddress);
}
