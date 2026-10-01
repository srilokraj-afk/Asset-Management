package com.enfec.one.asset.exception;
public class InvalidAssetStatusException extends RuntimeException{public InvalidAssetStatusException(String status){super("Unsupported asset status: "+status+". Supported statuses are IN_STOCK, ASSIGNED, IN_REPAIR, RETIRED.");}}
