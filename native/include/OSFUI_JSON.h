// JSON conveniences for the OSF UI 2.0 native request API.
#pragma once

#include "OSFUI.h"

#include <nlohmann/json.hpp>

#include <optional>
#include <string>
#include <string_view>

namespace OSFUI::API
{
	using Json = nlohmann::json;

	class JsonPayload
	{
	public:
		explicit JsonPayload(const char* payloadJson) noexcept
		{
			_payload = Json::parse(payloadJson ? payloadJson : "{}", nullptr, false);
			if (_payload.is_discarded()) {
				_error = "payload is not valid JSON";
				_payload = Json::object();
			} else if (!_payload.is_object()) {
				_error = "payload must be a JSON object";
				_payload = Json::object();
			}
		}

		[[nodiscard]] explicit operator bool() const noexcept { return _error.empty(); }
		[[nodiscard]] bool IsValid() const noexcept { return _error.empty(); }
		[[nodiscard]] std::string_view Error() const noexcept { return _error; }
		[[nodiscard]] const Json& Payload() const noexcept { return _payload; }

	protected:
		Json _payload{ Json::object() };
		std::string _error;
	};

	class JsonRequest final : public JsonPayload
	{
	public:
		explicit JsonRequest(const Request& request) noexcept :
			JsonPayload(request.payloadJson),
			_request(request)
		{
			if (!IsValid()) _request.Reject("invalid-payload", _error.c_str());
		}

		[[nodiscard]] std::string_view Name() const noexcept
		{
			return _request.name ? _request.name : "";
		}

		[[nodiscard]] std::string_view SourceViewId() const noexcept
		{
			return _request.sourceViewId ? _request.sourceViewId : "";
		}

		[[nodiscard]] const Request& Raw() const noexcept { return _request; }

		template <class T>
		[[nodiscard]] std::optional<T> Get(std::string_view key) const noexcept
		{
			try {
				const auto it = _payload.find(std::string(key));
				if (it != _payload.end()) return it->template get<T>();
			} catch (...) {}

			try {
				const auto message = "missing or invalid field: " + std::string(key);
				_request.Reject("invalid-payload", message.c_str());
			} catch (...) {
				_request.Reject("invalid-payload", "missing or invalid required field");
			}
			return std::nullopt;
		}

		bool Reply(const Json& payload) const noexcept
		{
			if (!IsValid()) return false;
			try {
				const auto text = payload.dump();
				_request.Reply(text.c_str());
				return true;
			} catch (...) {
				_request.Reject("serialization-error", "could not serialize response");
				return false;
			}
		}

		template <class T>
		bool Reply(const T& value) const noexcept
		{
			try {
				return Reply(Json(value));
			} catch (...) {
				_request.Reject("serialization-error", "could not serialize response");
				return false;
			}
		}

		void Reject(const char* code, const char* message = "") const noexcept
		{
			_request.Reject(code, message);
		}

	private:
		Request _request;
	};
}
