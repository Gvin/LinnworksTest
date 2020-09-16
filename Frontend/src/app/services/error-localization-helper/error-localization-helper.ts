import {ErrorLocalizationKeys} from './error-localization-keys';

export class ErrorLocalizationHelper {
  public static getLocalization(key: ErrorLocalizationKeys): string {
    switch (key) {
      case ErrorLocalizationKeys.DuplicateUserName:
        return 'User with such login has already registered.';
      case ErrorLocalizationKeys.PasswordTooShort:
        return 'Password length must be at least 3 symbols.';
      case ErrorLocalizationKeys.FileNotSelected:
        return 'File selection is required.';
      case ErrorLocalizationKeys.UnknownError:
      default:
        return 'Unknown error.';
    }
  }
}
