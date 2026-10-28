using System.Data;
using Dapper;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Exact SP names and @parameters from Repository.Fee.cs (legacy).
/// </summary>
public class FeeRepository : IFeeRepository
{
    private readonly IDbConnection _db;
    public FeeRepository(IDbConnection db) => _db = db;

    public async Task<IEnumerable<dynamic>> GetTransactionHistoryAsync(long payeeId)
    {
        var p = new DynamicParameters();
        p.Add("@PayeeID", payeeId);
        return await _db.QueryAsync<dynamic>("Fee_GetTransactionHistory", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<dynamic?> GetTransactionDetailsAsync(long transactionId)
    {
        var p = new DynamicParameters();
        p.Add("@TransactionID", transactionId);
        return await _db.QueryFirstOrDefaultAsync<dynamic>("Fee_GetTransactionDetails", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<long> SetFeeTransactionAsync(long payeeId, short phaseId, short gatewayId, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@PayeeID",          payeeId);
        p.Add("@PhaseID",          phaseId);
        p.Add("@PaymentGatewayID", gatewayId);
        p.Add("@UserLoginID",      userLoginId);
        p.Add("@IPAddress",        ipAddress);
        var r = await _db.ExecuteScalarAsync<object>("Fee_SetFeeTransaction", p, commandType: CommandType.StoredProcedure);
        return Convert.ToInt64(r ?? 0L);
    }

    public async Task<bool> SetOrderIdForRazorpayAsync(long transactionId, string orderId)
    {
        var p = new DynamicParameters();
        p.Add("@TransactionID", transactionId);
        p.Add("@OrderID",       orderId);
        await _db.ExecuteAsync("Fee_SetOrderIDForRazorPayTransaction", p, commandType: CommandType.StoredProcedure);
        return true;
    }

    public async Task<bool> SetFeeTransactionResponseAsync(long transactionId, string paymentId,
        string orderId, string signature, string bankRef, string status, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@TransactionID",        transactionId);
        p.Add("@PaymentID",            paymentId);
        p.Add("@OrderID",              orderId);
        p.Add("@Signature",            signature);
        p.Add("@BankReferenceNo",      bankRef);
        p.Add("@Status",               status);
        p.Add("@UserLoginID",          userLoginId);
        p.Add("@IPAddress",            ipAddress);
        var r = await _db.ExecuteScalarAsync<string>("Fee_SetFeeTransactionResponse", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    public async Task<IEnumerable<dynamic>> GetFailedTransactionsForApiCheckAsync(long payeeId)
    {
        var p = new DynamicParameters();
        p.Add("@PayeeID", payeeId);
        return await _db.QueryAsync<dynamic>("Fee_GetFailedTransactionForAPICheckForRazorPay", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<dynamic>> GetTransactionsForRefundAsync(string input)
    {
        var p = new DynamicParameters();
        p.Add("@InputValue", input);
        return await _db.QueryAsync<dynamic>("Fee_GetTransactionsForRefund", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> UpdateRefundStatusAsync(long transactionId, string refundId, string status, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@TransactionID", transactionId);
        p.Add("@RefundID",      refundId);
        p.Add("@Status",        status);
        p.Add("@UserLoginID",   userLoginId);
        p.Add("@IPAddress",     ipAddress);
        var r = await _db.ExecuteScalarAsync<string>("Fee_UpdateRefundStatus", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    private static string S(object? v) => Convert.ToString(v ?? "") ?? "";
}
