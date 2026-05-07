
package com.academia.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class RespuestaLogin {
    private String token;
    private String username;
    private String rol;
}
