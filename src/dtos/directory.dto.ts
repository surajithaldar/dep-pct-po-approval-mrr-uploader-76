import { IsEmail, IsString, IsNotEmpty, IsNumber,Length,IsUrl,IsBoolean,IsOptional,ValidateIf } from 'class-validator';

export class DirectoryList {
    @IsString()
    public prefix: string;
}

export class DirectoryPaginationList {
    @IsString()
    public prefix: string;
    @IsNumber()
    @IsNotEmpty()
    public startFrom: number;
    @IsString()
    public orderBy: string;
}

export class DirectorySearchList {
    @IsString()
    @IsNotEmpty()
    public searchKey: string;
    @IsNumber()
    @IsNotEmpty()
    public startFrom: number;
    @IsString()
    @IsNotEmpty()
    public orderBy: string;
}

export class createDirectory {
    @IsString()
    @IsNotEmpty()
    public delimiter
    @IsString()
    @IsNotEmpty()
    public prefix: string;
    @IsString()
    @IsNotEmpty()
    @Length(4, 150)
    public customerName: string;
    @IsString()
    @IsNotEmpty()
    @Length(1, 150)
    public model: string;
    @IsString()
    @IsNotEmpty()
    @Length(1, 150)
    public project: string;
    @IsUrl()
    @ValidateIf(e => e.spLink !== '') 
    public spLink: string;
    @IsNotEmpty()
    @IsBoolean()

    public specialJob:boolean;
}


export class updateDirectoryHeader {
 
    @IsString()
    @IsNotEmpty()
    public id: string;
    @IsString()
    @IsNotEmpty()
    @Length(4, 150)
    public customerName: string;
    @IsString()
    @IsNotEmpty()
    @Length(1, 150)
    public model: string;
    @IsString()
    @IsNotEmpty()
    @Length(1, 150)
    public project: string;
    @IsUrl()
    @ValidateIf(e => e.spLink !== '') 
    public spLink: string;
    @IsNotEmpty()
    @IsBoolean()

    public specialJob:boolean;
}


export class reqDirHeader {
    @IsString()
    @IsNotEmpty()
    public id: string;
}