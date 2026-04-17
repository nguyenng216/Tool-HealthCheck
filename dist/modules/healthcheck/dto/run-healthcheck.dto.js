"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunHealthcheckDto = exports.ExecutionMode = void 0;
const class_validator_1 = require("class-validator");
var ExecutionMode;
(function (ExecutionMode) {
    ExecutionMode["Parallel"] = "parallel";
    ExecutionMode["Sequence"] = "sequence";
})(ExecutionMode || (exports.ExecutionMode = ExecutionMode = {}));
class RunHealthcheckDto {
    deviceId;
    policy;
    mode;
}
exports.RunHealthcheckDto = RunHealthcheckDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], RunHealthcheckDto.prototype, "deviceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RunHealthcheckDto.prototype, "policy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ExecutionMode),
    __metadata("design:type", String)
], RunHealthcheckDto.prototype, "mode", void 0);
mode ?  : ExecutionMode;
//# sourceMappingURL=run-healthcheck.dto.js.map