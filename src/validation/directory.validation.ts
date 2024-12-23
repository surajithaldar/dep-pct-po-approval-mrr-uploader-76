import {
    validate,
    validateOrReject,
    Contains,
    IsInt,
    Length,
    IsEmail,
    IsFQDN,
    IsDate,
    Min,
    Max,
    IsString
} from 'class-validator';

export class DirListValidation {

    @IsString()
    required: true
    Prefix: string;
}