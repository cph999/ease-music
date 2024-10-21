package com.cph.musicbackend.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class CommonResult<T> {
    private Integer code;
    private String message;
    private Long total;
    private T data;
    private List<T> datas;

    public CommonResult() {
    }

    public CommonResult(Integer code, String message, T data, List<T> datas,Long total) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.datas = datas;
        this.total= total;
    }

    public CommonResult(Integer code, String message, T data, List<T> datas) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.datas = datas;
    }

    public CommonResult(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public CommonResult(Integer code, String message, List<T> datas) {
        this.code = code;
        this.message = message;
        this.datas = datas;
    }
}
