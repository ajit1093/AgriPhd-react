CREATE PROC Fee_GetFailedTransactionForAPICheckForRazorPay            
    @PayeeId BIGINT            
AS            
BEGIN            
    SELECT   
        TransactionID,  
        Optional1 AS OrderID   
    FROM   
        Fee_TransactionDetails (NOLOCK)   
    WHERE           
        PayeeID = @PayeeId   
        AND IsPaid = 0   
        AND (PhaseID = 99 OR PhaseID = 1 OR PhaseID = 2 OR PhaseID = 3 OR PhaseID = 4)  
    ORDER BY   
        TransactionID DESC           
END  
