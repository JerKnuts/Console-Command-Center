#include "CommandBatches.h"
#include <chrono>
#include <iostream>

namespace fs = std::filesystem;
void Check(bool value, const char* reason) { if (!value) throw std::runtime_error(reason); }
std::size_t BatchCount(const fs::path& directory) {
    std::size_t count = 0;
    for (const auto& entry : fs::directory_iterator(directory)) if (entry.path().extension() == L".txt") ++count;
    return count;
}
int main() {
    try {
        const auto directory = fs::temp_directory_path() / (L"ccc-sample-test-" + std::to_wstring(GetCurrentProcessId()) + L"-" + std::to_wstring(GetTickCount64()));
        fs::create_directories(directory);
        std::vector<std::string> warnings;
        CCC::CommandBatches::InstallSampleBatches(directory, warnings);
        Check(warnings.empty() && BatchCount(directory) == 3, "Empty folder did not receive exactly three samples.");
        const auto supplies = directory / L"Sample - Basic Supplies.txt";
        const auto materials = directory / L"Sample - Workshop Materials.txt";
        const auto starter = directory / L"Sample - Ballistic Starter Kit.txt";
        Check(CCC::CommandBatches::Commands(CCC::CommandBatches::ReadFile(supplies)).size() == 4, "Supply sample command count is incorrect.");
        Check(CCC::CommandBatches::Commands(CCC::CommandBatches::ReadFile(materials)).size() == 5, "Material sample command count is incorrect.");
        Check(CCC::CommandBatches::Commands(CCC::CommandBatches::ReadFile(starter)).size() == 2, "Starter sample command count is incorrect.");
        CCC::CommandBatches::WriteFile(supplies, "# My edited file\ntgm\n");
        CCC::CommandBatches::InstallSampleBatches(directory, warnings);
        Check(CCC::CommandBatches::ReadFile(supplies) == "# My edited file\ntgm\n", "User edits were overwritten.");
        fs::remove(supplies);
        CCC::CommandBatches::InstallSampleBatches(directory, warnings);
        Check(!fs::exists(supplies), "Deleted sample was recreated.");
        fs::remove(materials); fs::remove(starter);
        CCC::CommandBatches::InstallSampleBatches(directory, warnings);
        Check(BatchCount(directory) == 0, "Samples returned after all batches were deleted.");
        const auto existing = directory / L"Existing";
        fs::create_directories(existing);
        CCC::CommandBatches::WriteFile(existing / L"My Batch.txt", "tcl\n");
        CCC::CommandBatches::InstallSampleBatches(existing, warnings);
        Check(BatchCount(existing) == 1 && CCC::CommandBatches::ReadFile(existing / L"My Batch.txt") == "tcl\n", "Existing user folder was changed.");
        std::cout << "Sample batch checks passed: first use, contents, edits, deletion, empty-after-deletion, and existing folders.\nFixtures retained in " << directory.string() << '\n';
        return 0;
    } catch (const std::exception& error) { std::cerr << error.what() << '\n'; return 1; }
}
